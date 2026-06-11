import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getSupabase } from "@/lib/supabase/client";
import type { EventTypeRow } from "@/lib/types/database";

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from("event_types")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    return apiOk(data as EventTypeRow[]);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { slug, name_zh, name_en } = body;

    if (!slug || !name_zh || !name_en) {
      return apiOk({ error: "slug, name_zh, name_en are required" }, 400);
    }

    const { data, error } = await getSupabase()
      .from("event_types")
      .insert({ slug, name_zh, name_en })
      .select()
      .single();

    if (error) throw error;

    return apiOk(data as EventTypeRow, 201);
  } catch (err) {
    return handleError(err);
  }
}
