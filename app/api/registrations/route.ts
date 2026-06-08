import { NextResponse } from "next/server";

import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { getEnv } from "@/lib/env";
import { createRegistrationNotifier } from "@/lib/services/notifier";
import { createRegistration } from "@/lib/services/registrations";
import { getSupabase } from "@/lib/supabase/client";
import type { EventRow } from "@/lib/types/database";
import { createRegistrationSchema } from "@/lib/validations/registrations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createRegistrationSchema.parse(body);

    const { data: eventGuard, error: eventGuardError } = await getSupabase()
      .from("events")
      .select("carpool_enabled, rental_enabled")
      .eq("id", parsed.event_id)
      .single();

    if (eventGuardError || !eventGuard) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!eventGuard.carpool_enabled && parsed.transport !== "self") {
      return NextResponse.json(
        { error: "Carpool is not available for this event" },
        { status: 400 }
      );
    }

    if (!eventGuard.rental_enabled && parsed.rental_details != null) {
      return NextResponse.json(
        { error: "Equipment rental is not available for this event" },
        { status: 400 }
      );
    }

    const registration = await createRegistration(parsed);

    // Notifier reloads event so the service signature stays narrow (RegistrationRow only).
    // The extra query runs in the fire-and-forget path, off the response critical path.
    const { data: event } = await getSupabase()
      .from("events")
      .select("*")
      .eq("id", registration.event_id)
      .single();

    if (event) {
      const typedEvent: EventRow = event;
      const notifier = createRegistrationNotifier({
        registration,
        event: typedEvent,
        baseUrl: getEnv().canonicalUrl,
      });
      notifier
        .notifyAll()
        .catch((err) =>
          console.error("Failed to send registration notifications:", err)
        );
    }

    return apiOk(registration, 201);
  } catch (err) {
    return handleError(err);
  }
}
