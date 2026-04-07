import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { createRegistrationSchema } from "@/lib/validations/registrations";
import { sendRegistrationEmail } from "@/lib/email/send-registration-email";
import { sendAdminNotification } from "@/lib/email/send-admin-notification";
import type { EventRow } from "@/lib/types/database";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input = parsed.data;

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", input.event_id)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const typedEvent = event as EventRow;

  if (typedEvent.status !== "open") {
    return NextResponse.json(
      { error: "Event registration is closed" },
      { status: 400 }
    );
  }

  const amount_due =
    input.transport === "carpool"
      ? typedEvent.base_price + typedEvent.carpool_surcharge
      : typedEvent.base_price;

  const expires_at = new Date();
  expires_at.setDate(expires_at.getDate() + typedEvent.payment_days);

  const { data: registration, error: insertError } = await supabase
    .from("registrations")
    .insert({
      ...input,
      amount_due,
      expires_at: expires_at.toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seeyouwild.com";

  // Fire-and-forget emails
  sendRegistrationEmail({
    registrationId: registration.id,
    to: input.email,
    customerName: input.name,
    eventTitle: typedEvent.title,
    amountDue: amount_due,
    expiresAt: expires_at.toISOString(),
    baseUrl,
  }).catch((err) => console.error("Failed to send registration email:", err));

  sendAdminNotification({
    customerName: input.name,
    eventTitle: typedEvent.title,
    amountDue: amount_due,
    expiresAt: expires_at.toISOString(),
    adminUrl: `${baseUrl}/admin/registrations/${registration.id}`,
    adminEmail: process.env.ADMIN_EMAIL || "admin@seeyouwild.com",
  }).catch((err) => console.error("Failed to send admin notification:", err));

  return NextResponse.json(registration, { status: 201 });
}
