import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/client";
import { updateRegistrationSchema } from "@/lib/validations/registrations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const { data, error } = await getSupabase()
    .from("registrations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = { ...parsed.data };

  if (parsed.data.status === "paid") {
    updateData.confirmed_at = new Date().toISOString();
  }

  const { data, error } = await getSupabase()
    .from("registrations")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const { error } = await getSupabase()
    .from("registrations")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
