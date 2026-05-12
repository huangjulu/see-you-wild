import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { sendRegistrationCancelledEmail } from "@/lib/email/send-registration-cancelled-email";
import {
  AlreadyRegisteredError,
  InternalError,
  RegistrationNotFoundError,
} from "@/lib/errors/domain";
import { deleteRegistration } from "@/lib/services/registrations";
import { getSupabase } from "@/lib/supabase/client";
import type { EventRow, RegistrationRow } from "@/lib/types/database";
import { updateRegistrationSchema } from "@/lib/validations/registrations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data, error } = await getSupabase()
      .from("registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new RegistrationNotFoundError();
    }

    return apiOk(data);
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateRegistrationSchema.parse(body);

    const updateData: Record<string, unknown> = { ...parsed };

    if (parsed.status === "paid") {
      updateData.confirmed_at = new Date().toISOString();
    }

    const { data, error } = await getSupabase()
      .from("registrations")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      // PATCH may update email and collide with the (event_id, lower(email)) unique index.
      if (
        error.code === "23505" &&
        error.message?.includes("registrations_event_email")
      ) {
        throw new AlreadyRegisteredError();
      }
      throw new InternalError(error.message, error);
    }

    return apiOk(data);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data: regData, error: regError } = await getSupabase()
      .from("registrations")
      .select("name, email, event_id")
      .eq("id", id)
      .single();

    if (regError || !regData) {
      throw new RegistrationNotFoundError();
    }

    const reg = regData as Pick<RegistrationRow, "name" | "email" | "event_id">;

    const { data: eventData } = await getSupabase()
      .from("events")
      .select("title, start_date")
      .eq("id", reg.event_id)
      .single();

    await deleteRegistration(id);

    if (eventData) {
      const evt = eventData as Pick<EventRow, "title" | "start_date">;
      sendRegistrationCancelledEmail({
        to: reg.email,
        customerName: reg.name,
        eventTitle: evt.title,
        eventDate: evt.start_date,
      }).catch((err) =>
        console.error("[notifier] registration cancelled email failed", err)
      );
    }

    return apiOk({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
