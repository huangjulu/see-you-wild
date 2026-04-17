import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/client";

export async function GET() {
  const { count, error } = await getSupabase()
    .from("events")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    events: count,
    timestamp: new Date().toISOString(),
  });
}
