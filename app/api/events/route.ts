import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth/require-admin";
import { InternalError } from "@/lib/errors/domain";
import { getSupabase } from "@/lib/supabase/client";
import type {
  EventListDto,
  EventRow,
  RegistrationAdminDto,
} from "@/lib/types/database";
import { createEventSchema } from "@/lib/validations/events";

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
      .select(
        "id, name, email, phone, amount_due, status, transport, payment_ref, selected_date, created_at, event_id"
      )
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
    await requireAdmin();
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

function groupRegistrationsByEvent(
  registrations: RegistrationAdminDto[]
): Map<string, RegistrationAdminDto[]> {
  const map = new Map<string, RegistrationAdminDto[]>();
  for (const reg of registrations) {
    if (!map.has(reg.event_id)) map.set(reg.event_id, []);
    map.get(reg.event_id)!.push(reg);
  }
  return map;
}
