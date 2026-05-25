import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { sendRegistrationEmail } from "@/lib/email/send-registration-email";
import { getEnv } from "@/lib/env";
import { RegistrationNotFoundError } from "@/lib/errors/domain";
import { getSupabase } from "@/lib/supabase/client";
import type { EventRow, RegistrationRow } from "@/lib/types/database";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
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
      registrationId: typedRegistration.id,
      to: typedRegistration.email,
      customerName: typedRegistration.name,
      eventTitle: typedEvent.title,
      amountDue: typedRegistration.amount_due,
      expiresAt: typedRegistration.expires_at,
      baseUrl: getEnv().canonicalUrl,
      transport: typedRegistration.transport,
    });

    return apiOk({ sent: true });
  } catch (err) {
    return handleError(err);
  }
}
