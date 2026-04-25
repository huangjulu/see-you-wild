import { getSupabase } from "@/lib/supabase/client";
import { assignCarpool } from "@/lib/services/carpool";
import { apiOk, apiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ eventId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { eventId } = await params;

  const { data, error } = await getSupabase()
    .from("carpool_assignments")
    .select("*, registrations(name, email, phone)")
    .eq("event_id", eventId)
    .order("car_group", { ascending: true });

  if (error) {
    return apiError(error.message, 500);
  }

  return apiOk(data);
}

export async function POST(_request: Request, { params }: RouteParams) {
  const { eventId } = await params;
  const result = await assignCarpool(eventId);

  return result.ok
    ? apiOk(result.value, 201)
    : apiError(result.error, result.status);
}
