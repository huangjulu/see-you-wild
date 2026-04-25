import { getSupabase } from "@/lib/supabase/client";
import { createRegistrationSchema } from "@/lib/validations/registrations";
import { createRegistration } from "@/lib/services/registrations";
import { createRegistrationNotifier } from "@/lib/services/notifier";
import { apiOk } from "@/lib/api-response";
import { handleError } from "@/lib/api/handle-error";
import type { EventRow } from "@/lib/types/database";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createRegistrationSchema.parse(body);
    const registration = await createRegistration(parsed);

    // Notifier reloads event so the service signature stays narrow (RegistrationRow only).
    // The extra query runs in the fire-and-forget path, off the response critical path.
    const { data: event } = await getSupabase()
      .from("events")
      .select("*")
      .eq("id", registration.event_id)
      .single();

    if (event) {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "https://seeyouwild.com";
      const notifier = createRegistrationNotifier({
        registration,
        event: event as EventRow,
        baseUrl,
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
