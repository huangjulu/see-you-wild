import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getSupabase } from "@/lib/supabase/client";
import type { EventTypeRow } from "@/lib/types/database";
import { eventTypeSchema } from "@/lib/validations/event-types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, props: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await props.params;
    const body = await request.json();
    const parsed = eventTypeSchema.parse(body);

    const { data, error } = await getSupabase()
      .from("event_types")
      .update(parsed)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return apiOk(data as EventTypeRow);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_request: Request, props: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await props.params;

    const { error } = await getSupabase()
      .from("event_types")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return apiOk({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
