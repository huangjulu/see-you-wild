import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { paymentRefSchema } from "@/lib/validations/registrations";
import { verifyToken } from "@/lib/token";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const parsed = paymentRefSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!verifyToken(id, parsed.data.token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("registrations")
    .update({ payment_ref: parsed.data.payment_ref })
    .eq("id", id)
    .select("id, payment_ref")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
