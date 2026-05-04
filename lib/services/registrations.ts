import { sendRegistrationFailedEmail } from "@/lib/email/send-registration-failed-email";
import { sendRegistrationSuccessEmail } from "@/lib/email/send-registration-success-email";
import {
  AlreadyRegisteredError,
  EventClosedError,
  EventNotFoundError,
  HasCarpoolAssignmentError,
  InternalError,
  InvalidTokenError,
  RegistrationAlreadyReviewedError,
  RegistrationExpiredError,
  RegistrationNotFoundError,
  RegistrationPaidError,
} from "@/lib/errors/domain";
import { getSupabase } from "@/lib/supabase/client";
import { getPaymentToken } from "@/lib/token";
import type {
  EventRow,
  RegistrationRow,
  RegistrationStatus,
  Transport,
} from "@/lib/types/database";
import type { CreateRegistrationInput } from "@/lib/validations/registrations";

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

/**
 * Customer-side command: create a new registration row for an event.
 * Validates event existence and open status, computes amount/expiry via
 * createRegistrationService, and translates Postgres unique-violation
 * (constraint name `registrations_event_email...`) into AlreadyRegisteredError
 * so the route returns 409 instead of leaking a 500.
 *
 * Other 23505 codes (e.g. carpool unique) flow through as InternalError
 * to avoid mis-attributing them as "already registered".
 */
export async function createRegistration(
  input: CreateRegistrationInput
): Promise<RegistrationRow> {
  const { data: eventData, error: eventError } = await getSupabase()
    .from("events")
    .select("*")
    .eq("id", input.event_id)
    .single();

  if (eventError || !eventData) {
    throw new EventNotFoundError();
  }

  const event: EventRow = eventData;
  const service = createRegistrationService(event);
  if (!service.isOpen()) {
    throw new EventClosedError();
  }

  const amount_due = service.calculateAmountDue(input.transport);
  const expires_at = service.calculateExpiresAt();

  const { data: registration, error: insertError } = await getSupabase()
    .from("registrations")
    .insert({
      ...input,
      amount_due,
      expires_at: expires_at.toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    if (
      insertError.code === "23505" &&
      insertError.message?.includes("registrations_event_email")
    ) {
      throw new AlreadyRegisteredError();
    }
    throw new InternalError(insertError.message, insertError);
  }

  const row: RegistrationRow = registration;
  return row;
}

/**
 * Admin-side command: delete a registration row.
 * Guards against deleting a registration that still has an active carpool assignment —
 * ON DELETE CASCADE would silently remove the assignment and leave passengers stranded.
 * Admin must re-run carpool assignment to remove the person from their car group first.
 */
export async function deleteRegistration(id: string): Promise<void> {
  const { data: assignments } = await getSupabase()
    .from("carpool_assignments")
    .select("id")
    .eq("registration_id", id)
    .limit(1);

  if (assignments && assignments.length > 0) {
    throw new HasCarpoolAssignmentError();
  }

  const { error } = await getSupabase()
    .from("registrations")
    .delete()
    .eq("id", id);

  if (error) {
    throw new InternalError(error.message, error);
  }
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
  if (!getPaymentToken().verify(input.registrationId, input.token)) {
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

interface ReviewPaymentInput {
  registrationId: string;
  status: "paid" | "failed";
  baseUrl: string;
}

interface ReviewPaymentOutput {
  registrationId: string;
  status: RegistrationStatus;
}

export async function approveOrRejectPayment(
  input: ReviewPaymentInput
): Promise<ReviewPaymentOutput> {
  const { data: registration, error: regError } = await getSupabase()
    .from("registrations")
    .select(
      "id, name, email, event_id, status, amount_due, transport, dietary, wants_rental"
    )
    .eq("id", input.registrationId)
    .single();

  if (regError || !registration) {
    throw new RegistrationNotFoundError();
  }

  // Supabase client is untyped (SYW-049) — bridge cast to known fields
  const reg = registration as Pick<
    RegistrationRow,
    | "id"
    | "name"
    | "email"
    | "event_id"
    | "status"
    | "amount_due"
    | "transport"
    | "dietary"
    | "wants_rental"
  >;

  if (reg.status === "paid" || reg.status === "failed") {
    throw new RegistrationAlreadyReviewedError();
  }

  const { data: event, error: eventError } = await getSupabase()
    .from("events")
    .select("title, start_date, location")
    .eq("id", reg.event_id)
    .single();

  if (eventError || !event) {
    throw new EventNotFoundError();
  }

  const evt = event as Pick<EventRow, "title" | "start_date" | "location">;

  if (input.status === "paid") {
    const { error: updateError } = await getSupabase()
      .from("registrations")
      .update({ status: "paid", confirmed_at: new Date().toISOString() })
      .eq("id", input.registrationId)
      .eq("status", "pending")
      .select("id")
      .single();

    if (updateError) {
      throw new InternalError(updateError.message, updateError);
    }

    await sendRegistrationSuccessEmail({
      to: reg.email,
      customerName: reg.name,
      eventTitle: evt.title,
      eventDate: evt.start_date,
      eventLocation: evt.location,
      amountDue: reg.amount_due,
      transport: reg.transport,
      dietary: reg.dietary,
      wantsRental: reg.wants_rental,
    }).catch((err) =>
      console.error("[notifier] registration success email failed", err)
    );

    return { registrationId: input.registrationId, status: "paid" };
  }

  const { error: updateError } = await getSupabase()
    .from("registrations")
    .update({ status: "failed", payment_ref: null })
    .eq("id", input.registrationId)
    .eq("status", "pending")
    .select("id")
    .single();

  if (updateError) {
    throw new InternalError(updateError.message, updateError);
  }

  const newToken = getPaymentToken().generate(input.registrationId);
  const paymentRefUrl = `${input.baseUrl}/payment-ref?id=${input.registrationId}&token=${newToken}`;

  await sendRegistrationFailedEmail({
    to: reg.email,
    customerName: reg.name,
    eventTitle: evt.title,
    paymentRefUrl,
  }).catch((err) =>
    console.error("[notifier] registration failed email failed", err)
  );

  return { registrationId: input.registrationId, status: "failed" };
}
