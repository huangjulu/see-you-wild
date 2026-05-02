import { z } from "zod";
import { authenticateAdminAction } from "@/lib/auth/admin-action";
import { getSupabase } from "@/lib/supabase/client";
import { apiOk } from "@/lib/api-response";
import { handleError } from "@/lib/api/handle-error";
import { RegistrationNotFoundError, EventNotFoundError } from "@/lib/errors/domain";
import type { RegistrationRow, EventRow } from "@/lib/types/database";

const querySchema = z.object({
  token: z.string().min(1),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const parsed = querySchema.parse({ token: url.searchParams.get("token") ?? "" });

    authenticateAdminAction({
      registrationId: id,
      body: { token: parsed.token },
    });

    const { data: rawRegistration, error: regError } = await getSupabase()
      .from("registrations")
      .select("name, payment_ref, status, event_id")
      .eq("id", id)
      .single();

    if (regError || !rawRegistration) {
      throw new RegistrationNotFoundError();
    }

    // Supabase client is untyped (SYW-049); bridge cast at query boundary
    // Supabase client is untyped (SYW-049); bridge cast narrowed to selected columns
    const registration = rawRegistration as Pick<RegistrationRow, "name" | "payment_ref" | "status" | "event_id">;

    const { data: rawEvent, error: eventError } = await getSupabase()
      .from("events")
      .select("title")
      .eq("id", registration.event_id)
      .single();

    if (eventError || !rawEvent) {
      throw new EventNotFoundError();
    }

    // Supabase client is untyped (SYW-049); bridge cast at query boundary
    // Supabase client is untyped (SYW-049); bridge cast narrowed to selected columns
    const event = rawEvent as Pick<EventRow, "title">;

    return apiOk({
      customerName: registration.name,
      eventTitle: event.title,
      paymentRef: registration.payment_ref,
      status: registration.status,
    });
  } catch (err) {
    return handleError(err);
  }
}
