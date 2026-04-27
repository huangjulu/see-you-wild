import { getSupabase } from "@/lib/supabase/client";
import { apiOk } from "@/lib/api-response";
import { handleError } from "@/lib/api/handle-error";
import { InternalError } from "@/lib/errors/domain";

interface RouteParams {
  params: Promise<{ eventId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { eventId } = await params;

    const { data, error } = await getSupabase()
      .from("registrations")
      .select("id, name, status, transport, payment_ref, created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new InternalError(error.message, error);
    }

    return apiOk(data);
  } catch (err) {
    return handleError(err);
  }
}
