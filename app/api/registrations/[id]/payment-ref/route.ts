import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { sendAdminNotification } from "@/lib/email/send-admin-notification";
import { submitPaymentRef } from "@/lib/services/registrations";
import { getSupabase } from "@/lib/supabase/client";
import { getAdminToken } from "@/lib/token";
import type { EventRow, RegistrationRow } from "@/lib/types/database";
import { paymentRefSchema } from "@/lib/validations/registrations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = paymentRefSchema.parse(body);

    const result = await submitPaymentRef({
      registrationId: id,
      token: parsed.token,
      paymentRef: parsed.payment_ref,
    });

    // Fire-and-forget: send admin review notification after successful payment-ref submission
    void sendAdminReviewNotification(id, parsed.payment_ref, request);

    return apiOk({
      id: result.registrationId,
      payment_ref: result.paymentRef,
    });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * Fetch registration + event data and send admin notification email
 * with a review link. Failures are silently swallowed — the customer's
 * payment-ref submission should not fail because of an admin email issue.
 */
async function sendAdminReviewNotification(
  registrationId: string,
  paymentRef: string,
  request: Request
): Promise<void> {
  try {
    const { data: rawRegistration } = await getSupabase()
      .from("registrations")
      .select("name, email, amount_due, expires_at, event_id")
      .eq("id", registrationId)
      .single();

    if (!rawRegistration) return;

    // Supabase client is untyped (SYW-049); bridge cast at query boundary
    const reg = rawRegistration as Pick<
      RegistrationRow,
      "name" | "email" | "amount_due" | "expires_at" | "event_id"
    >;

    const { data: rawEvent } = await getSupabase()
      .from("events")
      .select("title")
      .eq("id", reg.event_id)
      .single();

    if (!rawEvent) return;

    // Supabase client is untyped (SYW-049); bridge cast at query boundary
    const evt = rawEvent as Pick<EventRow, "title">;

    const origin = new URL(request.url).origin;
    const token = getAdminToken().generate(registrationId);
    const reviewUrl = `${origin}/admin/review?id=${registrationId}&token=${token}`;

    await sendAdminNotification({
      customerName: reg.name,
      eventTitle: evt.title,
      amountDue: reg.amount_due,
      expiresAt: reg.expires_at,
      adminUrl: `${origin}/admin/registrations/${registrationId}`,
      adminEmail: process.env.ADMIN_EMAIL ?? "admin@seeyouwild.com",
      paymentRef,
      reviewUrl,
    });
  } catch {
    // silently swallow — admin email is best-effort
  }
}
