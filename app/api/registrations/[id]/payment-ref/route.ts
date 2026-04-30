import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { submitPaymentRef } from "@/lib/services/registrations";
import { paymentRefSchema } from "@/lib/validations/registrations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = paymentRefSchema.parse(body);

    const result = await submitPaymentRef({
      registrationId: id,
      token: parsed.token,
      paymentRef: parsed.payment_ref,
    });

    return apiOk({
      id: result.registrationId,
      payment_ref: result.paymentRef,
    });
  } catch (err) {
    return handleError(err);
  }
}
