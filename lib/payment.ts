/**
 * Shared payment bank info for the customer-facing registration flow.
 *
 * These are *public* values — they are rendered into the customer email
 * and the registration success page so the customer knows where to wire
 * the transfer. They are not secrets and don't belong in env vars
 * (env adds Vercel-dashboard indirection without buying anything for
 * a single-account, no-staging setup).
 *
 * When organizers split (per-event accounts) → move to the events table.
 * When a real payment gateway replaces direct bank transfer → these
 * three strings are not "consumed by the gateway", they disappear from
 * the email entirely (replaced by a "pay with Line Pay" button etc.),
 * so the contract here just gets deleted, not migrated.
 *
 * Placeholder values — edit before production traffic.
 */
export const paymentAccount = {
  bankName: "台灣銀行",
  bankAccount: "000-000-000000",
  accountHolder: "See You Wild",
} as const;
