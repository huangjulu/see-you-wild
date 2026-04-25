import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/client";
import { createRegistrationSchema } from "@/lib/validations/registrations";
import { createRegistrationService } from "@/lib/services/registrations";
import { createRegistrationNotifier } from "@/lib/services/notifier";
import type { EventRow, RegistrationRow } from "@/lib/types/database";

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

  const { data: event, error: eventError } = await getSupabase()
    .from("events")
    .select("*")
    .eq("id", input.event_id)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const typedEvent = event as EventRow;
  const service = createRegistrationService(typedEvent);

  if (!service.isOpen()) {
    return NextResponse.json(
      { error: "Event registration is closed" },
      { status: 400 }
    );
  }

  const amount_due = service.calculateAmountDue(input.transport);
  const expires_at = service.calculateExpiresAt();

  const { data: registration, error: insertError } = await getSupabase()
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
  const notifier = createRegistrationNotifier({
    registration: registration as RegistrationRow,
    event: typedEvent,
    baseUrl,
  });
  notifier
    .notifyAll()
    .catch((err) =>
      console.error("Failed to send registration notifications:", err)
    );

  return NextResponse.json(registration, { status: 201 });
}
