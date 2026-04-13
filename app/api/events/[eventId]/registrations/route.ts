import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/client";

interface RouteParams {
  params: Promise<{ eventId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { eventId } = await params;

  const { data, error } = await getSupabase()
    .from("registrations")
    .select("id, name, status, transport, payment_ref, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
