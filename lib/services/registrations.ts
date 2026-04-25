import { getSupabase } from "@/lib/supabase/client";
import { paymentToken } from "@/lib/token";
import { ok, fail, type ServiceResult } from "./result";
import type { EventRow, Transport } from "@/lib/types/database";

/**
 * Amount calculation strategies keyed by transport mode.
 * Future expansion (early-bird, member discount) extends this map
 * or composes multiple strategies into a higher-order strategy.
 */
type AmountStrategy = (event: EventRow) => number;

const amountStrategies: Record<Transport, AmountStrategy> = {
  self: (event) => event.base_price,
  carpool: (event) => event.base_price + event.carpool_surcharge,
};

/**
 * Build a registration service bound to a specific event.
 * Returns three closures that share the captured event reference:
 *   - isOpen              checks whether the event is accepting registrations
 *   - calculateAmountDue  selects an amount strategy by transport mode
 *   - calculateExpiresAt  computes the payment deadline from event.payment_days
 */
export function createRegistrationService(event: EventRow) {
  function isOpen(): boolean {
    return event.status === "open";
  }

  function calculateAmountDue(transport: Transport): number {
    return amountStrategies[transport](event);
  }

  function calculateExpiresAt(): Date {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + event.payment_days);
    return deadline;
  }

  return { isOpen, calculateAmountDue, calculateExpiresAt };
}

interface SubmitPaymentRefInput {
  registrationId: string;
  token: string;
  paymentRef: string;
}

interface SubmitPaymentRefOutput {
  registrationId: string;
  paymentRef: string;
}

/**
 * Customer-side command: write the bank-transfer reference back to a registration.
 * Owns every business rule between "incoming HMAC token" and "registration row updated":
 * token validity, registration existence, paid/expired state, and event-open guard.
 *
 * The route reduces to validation + result translation.
 */
export async function submitPaymentRef(
  input: SubmitPaymentRefInput
): Promise<ServiceResult<SubmitPaymentRefOutput>> {
  // ─── Authentication ────────────────────────────────────────
  if (!paymentToken().verify(input.registrationId, input.token)) {
    return fail("Invalid token", 403);
  }

  // ─── Load registration ─────────────────────────────────────
  const { data: registration, error: regError } = await getSupabase()
    .from("registrations")
    .select("status, expires_at, event_id")
    .eq("id", input.registrationId)
    .single();

  if (regError || !registration) {
    return fail("Registration not found", 404);
  }

  // ─── Registration-state guards ─────────────────────────────
  if (registration.status === "paid") {
    return fail("Registration already paid", 409);
  }
  if (new Date(registration.expires_at) < new Date()) {
    return fail("Registration expired", 410);
  }

  // ─── Event-state guard ─────────────────────────────────────
  const { data: event, error: eventError } = await getSupabase()
    .from("events")
    .select("status")
    .eq("id", registration.event_id)
    .single();

  if (eventError || !event) {
    return fail("Event not found", 404);
  }
  if (event.status !== "open") {
    return fail("Event registration is closed", 400);
  }

  // ─── Mutation ──────────────────────────────────────────────
  const { error: updateError } = await getSupabase()
    .from("registrations")
    .update({ payment_ref: input.paymentRef })
    .eq("id", input.registrationId);

  if (updateError) {
    return fail(updateError.message, 500);
  }

  return ok({
    registrationId: input.registrationId,
    paymentRef: input.paymentRef,
  });
}
