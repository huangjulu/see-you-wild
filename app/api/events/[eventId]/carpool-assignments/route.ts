import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { InternalError } from "@/lib/errors/domain";
import { assignCarpool } from "@/lib/services/carpool";
import { getSupabase } from "@/lib/supabase/client";

interface RouteParams {
  params: Promise<{ eventId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { eventId } = await params;

    const { data, error } = await getSupabase()
      .from("carpool_assignments")
      .select("*, registrations(name, email, phone)")
      .eq("event_id", eventId)
      .order("car_group", { ascending: true });

    if (error) {
      throw new InternalError(error.message, error);
    }

    return apiOk(data);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { eventId } = await params;
    const assignments = await assignCarpool(eventId);
    return apiOk(assignments, 201);
  } catch (err) {
    return handleError(err);
  }
}
