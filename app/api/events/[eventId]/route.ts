import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import {
  CarpoolCutoffInPastError,
  CarpoolDatesLockedError,
  EventNotFoundError,
  InternalError,
} from "@/lib/errors/domain";
import { getSupabase } from "@/lib/supabase/client";
import type { EventRow } from "@/lib/types/database";
import { deleteEventSchema, updateEventSchema } from "@/lib/validations/events";

interface RouteParams {
  params: Promise<{ eventId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { eventId } = await params;

    const { data, error } = await getSupabase()
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (error || !data) {
      throw new EventNotFoundError();
    }

    const typedEvent: EventRow = data;
    return apiOk(typedEvent);
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { eventId } = await params;
    const body = await request.json();
    const parsed = updateEventSchema.parse(body);

    const payloadMentionsCarpoolDates =
      parsed.start_date !== undefined ||
      parsed.carpool_cutoff_days !== undefined;

    if (payloadMentionsCarpoolDates) {
      // Fetch existing values to detect whether the carpool-relevant fields truly changed.
      const { data: existing } = await getSupabase()
        .from("events")
        .select("start_date, carpool_cutoff_days")
        .eq("id", eventId)
        .single();

      if (!existing) {
        throw new EventNotFoundError();
      }

      const startDateChanged =
        parsed.start_date != null && parsed.start_date !== existing.start_date;
      const cutoffDaysChanged =
        parsed.carpool_cutoff_days != null &&
        parsed.carpool_cutoff_days !== existing.carpool_cutoff_days;
      const carpoolDatesActuallyChanged = startDateChanged || cutoffDaysChanged;

      if (carpoolDatesActuallyChanged) {
        // Guard 1: carpool assignments already exist → block modification
        const { data: assignments } = await getSupabase()
          .from("carpool_assignments")
          .select("id")
          .eq("event_id", eventId);

        if (assignments && assignments.length > 0) {
          throw new CarpoolDatesLockedError();
        }

        // Guard 2: new cutoff date must not be in the past
        const newStartDate = parsed.start_date ?? existing.start_date;
        const newCutoffDays =
          parsed.carpool_cutoff_days ?? existing.carpool_cutoff_days ?? 3;

        // Parse YYYY-MM-DD parts to avoid UTC-vs-local midnight mismatch when
        // new Date("YYYY-MM-DD") creates a UTC midnight that compares wrong in +8 timezones.
        const [year, month, day] = newStartDate
          .split("-")
          .map((s: string) => parseInt(s, 10));
        const cutoffDate = new Date(year, month - 1, day - newCutoffDays);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (cutoffDate < today) {
          throw new CarpoolCutoffInPastError();
        }
      }
    }

    const { data, error } = await getSupabase()
      .from("events")
      .update(parsed)
      .eq("id", eventId)
      .select()
      .single();

    if (error) {
      throw new InternalError(error.message, error);
    }

    if (!data) {
      throw new EventNotFoundError();
    }

    return apiOk(data);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { eventId } = await params;
    const body = await request.json();
    const { cancellation_reason } = deleteEventSchema.parse(body);

    const { data: registrations } = await getSupabase()
      .from("registrations")
      .select("id, name, email, event_id")
      .eq("event_id", eventId);

    const { data: event } = await getSupabase()
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (!event) {
      throw new EventNotFoundError();
    }

    const { error } = await getSupabase()
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) {
      throw new InternalError(error.message, error);
    }

    const typedEvent: EventRow = event;

    if (registrations && registrations.length > 0) {
      const { sendEventCancelledEmail } =
        await import("@/lib/email/send-event-cancelled-email");

      const emailPromises = registrations.map((reg) =>
        sendEventCancelledEmail({
          to: reg.email,
          customerName: reg.name,
          eventTitle: typedEvent.title,
          eventDate: typedEvent.start_date,
          eventLocation: typedEvent.location,
          cancellationReason: cancellation_reason,
        }).catch((err) =>
          console.error(
            `Failed to send cancellation email to ${reg.email}:`,
            err
          )
        )
      );

      Promise.all(emailPromises).catch(() => {});
    }

    return apiOk({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
