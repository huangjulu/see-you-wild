import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { createEventSchema } from "@/lib/validations/events";
import type {
  EventRow,
  EventListDto,
  RegistrationSummaryDto,
} from "@/lib/types/database";

export async function GET() {
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: true });

  if (eventsError) {
    return NextResponse.json({ error: eventsError.message }, { status: 500 });
  }

  const result: EventListDto[] = [];

  for (const event of events as EventRow[]) {
    const { data: registrations, error: regError } = await supabase
      .from("registrations")
      .select("id, name, status, transport, payment_ref, created_at")
      .eq("event_id", event.id);

    if (regError) {
      return NextResponse.json({ error: regError.message }, { status: 500 });
    }

    result.push({
      ...event,
      registrations: (registrations ?? []) as RegistrationSummaryDto[],
    });
  }

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("events")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
