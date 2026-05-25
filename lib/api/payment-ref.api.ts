import { useMutation, useQuery } from "@tanstack/react-query";

interface PaymentRefInfo {
  name: string;
  amount_due: number;
  expires_at: string;
  payment_ref: string | null;
  status: string;
  event_title: string;
}

interface SubmitPaymentRefInput {
  id: string;
  token: string;
  payment_ref: string;
}

interface ApiError {
  error: string;
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (response.ok) {
    return response.json();
  }

  const body: ApiError | null = await response.json().catch(() => null);
  throw new Error(body?.error ?? `Request failed: ${response.status}`);
}

export const paymentRefApi = {
  useInfo: (id: string | null, token: string | null) =>
    useQuery<PaymentRefInfo>({
      queryKey: ["payment-ref", id],
      queryFn: () =>
        apiFetch<PaymentRefInfo>(
          `/api/registrations/${id}/payment-ref-info?token=${encodeURIComponent(token ?? "")}`
        ),
      enabled: id != null && token != null,
    }),

  useSubmit: () =>
    useMutation<unknown, Error, SubmitPaymentRefInput>({
      mutationFn: ({ id, token, payment_ref }) =>
        apiFetch(`/api/registrations/${id}/payment-ref`, {
          method: "PATCH",
          body: JSON.stringify({ payment_ref, token }),
        }),
    }),
};
