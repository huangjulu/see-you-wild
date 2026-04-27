import { sendRegistrationEmail } from "@/lib/email/send-registration-email";
import { sendAdminNotification } from "@/lib/email/send-admin-notification";
import type { RegistrationRow, EventRow } from "@/lib/types/database";

interface NotifierContext {
  registration: RegistrationRow;
  event: EventRow;
  baseUrl: string;
}

/**
 * Build a notifier bound to one registration event.
 * Returns a single closure `notifyAll` that fans out to all channels in parallel,
 * isolating per-channel failures via Promise.allSettled so one bad email
 * does not abort the others.
 *
 * Adding a new channel (LINE, SMS) means adding another internal closure
 * and including it in the notifyAll list — callers stay unchanged.
 */
export function createRegistrationNotifier(context: NotifierContext) {
  const { registration, event, baseUrl } = context;

  function notifyCustomer(): Promise<void> {
    return sendRegistrationEmail({
      registrationId: registration.id,
      to: registration.email,
      customerName: registration.name,
      eventTitle: event.title,
      amountDue: registration.amount_due,
      expiresAt: registration.expires_at,
      baseUrl,
    });
  }

  function notifyAdmin(): Promise<void> {
    return sendAdminNotification({
      customerName: registration.name,
      eventTitle: event.title,
      amountDue: registration.amount_due,
      expiresAt: registration.expires_at,
      adminUrl: `${baseUrl}/admin/registrations/${registration.id}`,
      adminEmail: process.env.ADMIN_EMAIL ?? "admin@seeyouwild.com",
    });
  }

  async function notifyAll(): Promise<void> {
    await Promise.allSettled([notifyCustomer(), notifyAdmin()]);
  }

  return { notifyAll };
}
