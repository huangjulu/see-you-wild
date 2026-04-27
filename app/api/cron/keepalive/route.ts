import { getSupabase } from "@/lib/supabase/client";
import { apiOk } from "@/lib/api-response";
import { handleError } from "@/lib/api/handle-error";
import { InternalError } from "@/lib/errors/domain";

export async function GET() {
  try {
    const { count, error } = await getSupabase()
      .from("events")
      .select("id", { count: "exact", head: true });

    if (error) {
      throw new InternalError(error.message, error);
    }

    return apiOk({
      ok: true,
      events: count,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return handleError(err);
  }
}
