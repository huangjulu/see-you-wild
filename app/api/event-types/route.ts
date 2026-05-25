import { apiOk } from "@/lib/api-response";
import { getSupabase } from "@/lib/supabase/client";

export async function GET() {
  const { data } = await getSupabase()
    .from("events")
    .select("type")
    .eq("status", "open");

  const types = Array.from(new Set((data ?? []).map((e) => e.type)));

  return apiOk(types);
}
