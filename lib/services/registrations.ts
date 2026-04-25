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
