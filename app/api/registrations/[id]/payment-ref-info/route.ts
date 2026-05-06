import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import {
  InvalidTokenError,
  RegistrationNotFoundError,
} from "@/lib/errors/domain";
import { getSupabase } from "@/lib/supabase/client";
import { getPaymentToken } from "@/lib/token";
import type { EventRow, RegistrationRow } from "@/lib/types/database";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token || !getPaymentToken().verify(id, token)) {
      throw new InvalidTokenError();
    }

    const { data: registration, error: regError } = await getSupabase()
      .from("registrations")
      .select("name, amount_due, expires_at, payment_ref, status, event_id")
      .eq("id", id)
      .single();

    if (regError || !registration) {
      throw new RegistrationNotFoundError();
    }

    // Supabase client is untyped (SYW-049); bridge cast at query boundary
    const reg = registration as Pick<
      RegistrationRow,
      | "name"
      | "amount_due"
      | "expires_at"
      | "payment_ref"
      | "status"
      | "event_id"
    >;

    const { data: event, error: eventError } = await getSupabase()
      .from("events")
      .select("title")
      .eq("id", reg.event_id)
      .single();

    if (eventError || !event) {
      throw new RegistrationNotFoundError();
    }

    // Supabase client is untyped (SYW-049); bridge cast at query boundary
    const evt = event as Pick<EventRow, "title">;

    return apiOk({
      name: reg.name,
      amount_due: reg.amount_due,
      expires_at: reg.expires_at,
      payment_ref: reg.payment_ref,
      status: reg.status,
      event_title: evt.title,
    });
  } catch (err) {
    return handleError(err);
  }
}
