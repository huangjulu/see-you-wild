import { getSupabase } from "@/lib/supabase/client";
import { createEventSchema } from "@/lib/validations/events";
import { apiOk } from "@/lib/api-response";
import { handleError } from "@/lib/api/handle-error";
import { InternalError } from "@/lib/errors/domain";
import type {
  EventRow,
  EventListDto,
  RegistrationSummaryDto,
} from "@/lib/types/database";

export async function GET() {
  try {
    const { data: events, error: eventsError } = await getSupabase()
      .from("events")
      .select("*")
      .order("start_date", { ascending: true });

    if (eventsError) {
      throw new InternalError(eventsError.message, eventsError);
    }

    const typedEvents: EventRow[] = events ?? [];
    const eventIds = typedEvents.map((e) => e.id);

    // Single batched read instead of N+1 per-event queries (SYW-036 I7).
    const { data: allRegistrations, error: regError } = await getSupabase()
      .from("registrations")
      .select("id, name, status, transport, payment_ref, created_at, event_id")
      .in("event_id", eventIds);

    if (regError) {
      throw new InternalError(regError.message, regError);
    }

    const byEvent = groupRegistrationsByEvent(allRegistrations ?? []);

    const result: EventListDto[] = typedEvents.map((event) => ({
      ...event,
      registrations: byEvent.get(event.id) ?? [],
    }));

    return apiOk(result);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createEventSchema.parse(body);

    const { data, error } = await getSupabase()
      .from("events")
      .insert(parsed)
      .select()
      .single();

    if (error) {
      throw new InternalError(error.message, error);
    }

    return apiOk(data, 201);
  } catch (err) {
    return handleError(err);
  }
}

type JoinedRegistration = RegistrationSummaryDto & { event_id: string };

function groupRegistrationsByEvent(
  registrations: JoinedRegistration[]
): Map<string, RegistrationSummaryDto[]> {
  const map = new Map<string, RegistrationSummaryDto[]>();
  for (const reg of registrations) {
    if (!map.has(reg.event_id)) map.set(reg.event_id, []);
    map.get(reg.event_id)!.push(reg);
  }
  return map;
}
