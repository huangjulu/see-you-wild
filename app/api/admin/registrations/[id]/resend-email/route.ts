import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sendRegistrationEmail } from "@/lib/email/send-registration-email";
import { RegistrationNotFoundError } from "@/lib/errors/domain";
import { getSupabase } from "@/lib/supabase/client";
import type { EventRow, RegistrationRow } from "@/lib/types/database";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    const { data: registration, error: regError } = await getSupabase()
      .from("registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (regError || !registration) {
      throw new RegistrationNotFoundError();
    }

    const typedRegistration: RegistrationRow = registration;

    const { data: event } = await getSupabase()
      .from("events")
      .select("*")
      .eq("id", typedRegistration.event_id)
      .single();

    if (!event) {
      throw new RegistrationNotFoundError();
    }

    const typedEvent: EventRow = event;

    await sendRegistrationEmail({
      to: typedRegistration.email,
      customerName: typedRegistration.name,
      eventTitle: typedEvent.title,
      amountDue: typedRegistration.amount_due,
      expiresAt: typedRegistration.expires_at,
      transport: typedRegistration.transport,
    });

    return apiOk({ sent: true });
  } catch (err) {
    return handleError(err);
  }
}
