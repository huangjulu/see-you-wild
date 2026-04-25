import { getSupabase } from "@/lib/supabase/client";
import { apiOk, apiError } from "@/lib/api-response";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return apiError("Unauthorized", 401);
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
    return apiError(error.message, 500);
  }

  return apiOk({
    deleted: data?.length ?? 0,
    timestamp: now,
  });
}
