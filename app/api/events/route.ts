import { getSupabase } from "@/lib/supabase/client";
import { createEventSchema } from "@/lib/validations/events";
import { apiOk, apiError } from "@/lib/api-response";
import type {
  EventRow,
  EventListDto,
  RegistrationSummaryDto,
} from "@/lib/types/database";

export async function GET() {
  const { data: events, error: eventsError } = await getSupabase()
    .from("events")
    .select("*")
    .order("start_date", { ascending: true });

  if (eventsError) {
    return apiError(eventsError.message, 500);
  }

  const typedEvents = (events ?? []) as EventRow[];
  const eventIds = typedEvents.map((e) => e.id);

  // Single batched read instead of N+1 per-event queries (SYW-036 I7).
  const { data: allRegistrations, error: regError } = await getSupabase()
    .from("registrations")
    .select("id, name, status, transport, payment_ref, created_at, event_id")
    .in("event_id", eventIds);

  if (regError) {
    return apiError(regError.message, 500);
  }

  const byEvent = groupRegistrationsByEvent(allRegistrations ?? []);

  const result: EventListDto[] = typedEvents.map((event) => ({
    ...event,
    registrations: byEvent.get(event.id) ?? [],
  }));

  return apiOk(result);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createEventSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Validation failed", 400, parsed.error.flatten());
  }

  const { data, error } = await getSupabase()
    .from("events")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    return apiError(error.message, 500);
  }

  return apiOk(data, 201);
}

function groupRegistrationsByEvent(
  registrations: unknown[]
): Map<string, RegistrationSummaryDto[]> {
  type Joined = RegistrationSummaryDto & { event_id: string };
  const map = new Map<string, RegistrationSummaryDto[]>();
  for (const reg of registrations as Joined[]) {
    if (!map.has(reg.event_id)) map.set(reg.event_id, []);
    map.get(reg.event_id)!.push(reg);
  }
  return map;
}
