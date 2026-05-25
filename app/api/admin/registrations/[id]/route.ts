import { NextResponse } from "next/server";

import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { sendRegistrationCancelledEmail } from "@/lib/email/send-registration-cancelled-email";
import {
  AlreadyRegisteredError,
  InternalError,
  RegistrationNotFoundError,
} from "@/lib/errors/domain";
import { deleteRegistration } from "@/lib/services/registrations";
import { getSupabase } from "@/lib/supabase/client";
import type { EventRow, RegistrationRow } from "@/lib/types/database";
import { updateRegistrationSchema } from "@/lib/validations/registrations";

const CARPOOL_FIELDS = [
  "carpool_role",
  "seat_count",
  "pickup_location",
] as const;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data, error } = await getSupabase()
      .from("registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new RegistrationNotFoundError();
    }

    return apiOk(data);
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = updateRegistrationSchema.parse(body);

    const { data: existing, error: fetchError } = await getSupabase()
      .from("registrations")
      .select("transport, event_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      throw new RegistrationNotFoundError();
    }

    const reg = existing as Pick<RegistrationRow, "transport" | "event_id">;

    if (reg.transport === "carpool" && parsed.transport === "self") {
      return NextResponse.json(
        { error: "Cannot switch from carpool to self transport" },
        { status: 400 }
      );
    }

    if (reg.transport === "self" && parsed.transport === "carpool") {
      if (!parsed.carpool_role || !parsed.pickup_location) {
        return NextResponse.json(
          {
            error:
              "carpool_role and pickup_location are required when switching to carpool",
          },
          { status: 400 }
        );
      }
    }

    const carpoolFieldChanged = CARPOOL_FIELDS.some((field) => field in body);

    if (carpoolFieldChanged && reg.transport === "carpool") {
      const { data: eventData } = await getSupabase()
        .from("events")
        .select("start_date, carpool_cutoff_days")
        .eq("id", reg.event_id)
        .single();

      if (eventData) {
        const evt = eventData as Pick<
          EventRow,
          "start_date" | "carpool_cutoff_days"
        >;
        const startDate = new Date(evt.start_date);
        const cutoffDate = new Date(startDate);
        cutoffDate.setDate(cutoffDate.getDate() - evt.carpool_cutoff_days);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        cutoffDate.setHours(0, 0, 0, 0);

        if (today >= cutoffDate) {
          return NextResponse.json(
            { error: "Carpool preferences are locked after the cutoff date" },
            { status: 400 }
          );
        }
      }
    }

    const updateData: Record<string, unknown> = { ...parsed };

    if (parsed.status === "paid") {
      updateData.confirmed_at = new Date().toISOString();
    }

    const { data, error } = await getSupabase()
      .from("registrations")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (
        error.code === "23505" &&
        error.message?.includes("registrations_event_email")
      ) {
        throw new AlreadyRegisteredError();
      }
      throw new InternalError(error.message, error);
    }

    return apiOk(data);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data: regData, error: regError } = await getSupabase()
      .from("registrations")
      .select("name, email, event_id")
      .eq("id", id)
      .single();

    if (regError || !regData) {
      throw new RegistrationNotFoundError();
    }

    const reg = regData as Pick<RegistrationRow, "name" | "email" | "event_id">;

    const { data: eventData } = await getSupabase()
      .from("events")
      .select("title, start_date")
      .eq("id", reg.event_id)
      .single();

    await deleteRegistration(id);

    if (eventData) {
      const evt = eventData as Pick<EventRow, "title" | "start_date">;
      sendRegistrationCancelledEmail({
        to: reg.email,
        customerName: reg.name,
        eventTitle: evt.title,
        eventDate: evt.start_date,
      }).catch((err) =>
        console.error("[notifier] registration cancelled email failed", err)
      );
    }

    return apiOk({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
