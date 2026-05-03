import { z } from "zod";

import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { authenticateAdminAction } from "@/lib/auth/admin-action";
import { getEnv } from "@/lib/env";
import { reviewPayment } from "@/lib/services/registrations";

const reviewSchema = z.object({
  token: z.string().min(1),
  status: z.enum(["paid", "failed"]),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = reviewSchema.parse(body);

    authenticateAdminAction({
      registrationId: id,
      body: { token: parsed.token },
    });

    const result = await reviewPayment({
      registrationId: id,
      status: parsed.status,
      baseUrl: getEnv().canonicalUrl,
    });

    return apiOk({ id: result.registrationId, status: result.status });
  } catch (err) {
    return handleError(err);
  }
}
