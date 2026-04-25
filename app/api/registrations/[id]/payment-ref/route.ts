import { paymentRefSchema } from "@/lib/validations/registrations";
import { submitPaymentRef } from "@/lib/services/registrations";
import { apiOk, apiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const parsed = paymentRefSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Validation failed", 400, parsed.error.flatten());
  }

  const result = await submitPaymentRef({
    registrationId: id,
    token: parsed.data.token,
    paymentRef: parsed.data.payment_ref,
  });

  return result.ok
    ? apiOk({
        id: result.value.registrationId,
        payment_ref: result.value.paymentRef,
      })
    : apiError(result.error, result.status);
}
