import { useMutation, useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/api-fetch";

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
