import { getSupabase } from "@/lib/supabase/client";
import { paymentToken } from "@/lib/token";
import {
  EventClosedError,
  EventNotFoundError,
  InternalError,
  InvalidTokenError,
  RegistrationExpiredError,
  RegistrationNotFoundError,
  RegistrationPaidError,
} from "@/lib/errors/domain";
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
 * Throws DomainError subclasses on failure; route layer translates via handleError.
 */
export async function submitPaymentRef(
  input: SubmitPaymentRefInput
): Promise<SubmitPaymentRefOutput> {
  if (!paymentToken().verify(input.registrationId, input.token)) {
    throw new InvalidTokenError();
  }

  const { data: registration, error: regError } = await getSupabase()
    .from("registrations")
    .select("status, expires_at, event_id")
    .eq("id", input.registrationId)
    .single();

  if (regError || !registration) {
    throw new RegistrationNotFoundError();
  }

  if (registration.status === "paid") {
    throw new RegistrationPaidError();
  }
  if (new Date(registration.expires_at) < new Date()) {
    throw new RegistrationExpiredError();
  }

  const { data: event, error: eventError } = await getSupabase()
    .from("events")
    .select("status")
    .eq("id", registration.event_id)
    .single();

  if (eventError || !event) {
    throw new EventNotFoundError();
  }
  if (event.status !== "open") {
    throw new EventClosedError();
  }

  const { error: updateError } = await getSupabase()
    .from("registrations")
    .update({ payment_ref: input.paymentRef })
    .eq("id", input.registrationId);

  if (updateError) {
    throw new InternalError(updateError.message, updateError);
  }

  return {
    registrationId: input.registrationId,
    paymentRef: input.paymentRef,
  };
}
