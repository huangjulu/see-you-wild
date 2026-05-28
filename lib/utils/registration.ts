export function isPendingReview(
  reg: Pick<
    { status: string; payment_ref: string | null },
    "status" | "payment_ref"
  >
): boolean {
  return reg.status === "pending" && reg.payment_ref != null;
}

export function sortPendingReviewFirst<
  T extends Pick<
    { status: string; payment_ref: string | null },
    "status" | "payment_ref"
  >,
>(a: T, b: T): number {
  const aPending = isPendingReview(a);
  const bPending = isPendingReview(b);
  if (aPending && !bPending) return -1;
  if (!aPending && bPending) return 1;
  return 0;
}

export function matchesSearchQuery(
  reg: { name: string; email: string; payment_ref: string | null },
  query: string
): boolean {
  const q = query.toLowerCase();
  return (
    reg.name.toLowerCase().includes(q) ||
    reg.email.toLowerCase().includes(q) ||
    (reg.payment_ref?.toLowerCase().includes(q) ?? false)
  );
}
