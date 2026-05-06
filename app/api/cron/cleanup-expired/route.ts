import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { InternalError, UnauthorizedError } from "@/lib/errors/domain";
import { getSupabase } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      throw new UnauthorizedError();
    }

    const now = new Date().toISOString();

    // Skip rows where the customer has already filled payment_ref but admin hasn't confirmed yet.
    // Otherwise we'd delete a registration the customer believes is paid (SYW-036 I6).
    const { data, error } = await getSupabase()
      .from("registrations")
      .delete()
      .eq("status", "pending")
      .is("payment_ref", null)
      .lt("expires_at", now)
      .select("id");

    if (error) {
      throw new InternalError(error.message, error);
    }

    return apiOk({
      deleted: data?.length ?? 0,
      timestamp: now,
    });
  } catch (err) {
    return handleError(err);
  }
}
