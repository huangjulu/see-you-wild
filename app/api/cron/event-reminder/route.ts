import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { sendAdminCarpoolSummaryEmail } from "@/lib/email/send-admin-carpool-summary-email";
import { sendEventReminderEmail } from "@/lib/email/send-event-reminder-email";
import { getEnv } from "@/lib/env";
import { InternalError, UnauthorizedError } from "@/lib/errors/domain";
import { assignCarpool } from "@/lib/services/carpool";
import { getSupabase } from "@/lib/supabase/client";

interface ProcessResult {
  eventId: string;
  status: "ok" | "error";
  error?: string;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      throw new UnauthorizedError();
    }

    const today = new Date().toISOString().slice(0, 10);

    const { data: events, error: eventsError } = await getSupabase()
      .from("events")
      .select(
        "id, title, start_date, location, status, carpool_cutoff_days, reminder_sent_at"
      )
      .eq("status", "open")
      .is("reminder_sent_at", null);

    if (eventsError) {
      throw new InternalError(eventsError.message, eventsError);
    }

    const eligible = (events ?? []).filter((e) => {
      const cutoff = new Date(e.start_date);
      cutoff.setDate(cutoff.getDate() - e.carpool_cutoff_days);
      const todayDate = new Date(today);
      return cutoff <= todayDate;
    });

    const results: ProcessResult[] = [];

    for (const event of eligible) {
      try {
        const assignments = await assignCarpool(event.id);

        const { data: registrations, error: regError } = await getSupabase()
          .from("registrations")
          .select("id, name, email, transport, seat_count")
          .eq("event_id", event.id)
          .eq("status", "paid");

        if (regError) {
          throw new InternalError(regError.message, regError);
        }

        const eventUrl = `${getEnv().canonicalUrl}/zh-TW/events/${event.id}`;
        const eventDate = event.start_date;

        for (const reg of registrations ?? []) {
          const assignment = assignments.find(
            (a) => a.registration_id === reg.id
          );

          const finalRole =
            assignment?.final_role === "driver" ||
            assignment?.final_role === "passenger"
              ? (assignment.final_role satisfies "driver" | "passenger")
              : undefined;

          const group = assignment
            ? assignments.filter((a) => a.car_group === assignment.car_group)
            : undefined;

          const passengerCount = group
            ? group.filter((a) => a.final_role === "passenger").length
            : undefined;

          const hasDriver = group
            ? group.some((a) => a.final_role === "driver")
            : undefined;

          await sendEventReminderEmail({
            to: reg.email,
            customerName: reg.name,
            eventTitle: event.title,
            eventDate,
            eventLocation: event.location,
            eventUrl,
            transport: reg.transport === "carpool" ? "carpool" : "self",
            finalRole,
            pickupLocation: assignment?.pickup_location,
            carGroup: assignment?.car_group,
            passengerCount,
            refundAmount: assignment?.refund_amount,
            hasDriver,
          });
        }

        if (assignments.length > 0) {
          const groupNumbers = [
            ...new Set(assignments.map((a) => a.car_group)),
          ];

          const groups = groupNumbers.map((carGroup) => {
            const members = assignments.filter((a) => a.car_group === carGroup);
            const driverAssignment = members.find(
              (a) => a.final_role === "driver"
            );
            const driverReg = driverAssignment
              ? (registrations ?? []).find(
                  (r) => r.id === driverAssignment.registration_id
                )
              : null;

            const passengerCount = members.filter(
              (a) => a.final_role === "passenger"
            ).length;

            const seatCount = driverReg?.seat_count ?? null;

            return {
              carGroup,
              pickupLocation: members[0].pickup_location,
              driverName: driverReg?.name ?? null,
              seatCount,
              passengerCount,
              remainingSeats:
                seatCount != null ? seatCount - passengerCount : null,
            };
          });

          const adminEmail = process.env.ADMIN_EMAIL ?? "admin@seeyouwild.com";

          await sendAdminCarpoolSummaryEmail({
            to: adminEmail,
            eventTitle: event.title,
            eventDate,
            eventUrl,
            groups,
          });
        }

        const { error: updateError } = await getSupabase()
          .from("events")
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq("id", event.id);

        if (updateError) {
          throw new InternalError(updateError.message, updateError);
        }

        results.push({ eventId: event.id, status: "ok" });
      } catch (err) {
        results.push({
          eventId: event.id,
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return apiOk({
      processed: eligible.length,
      results,
      timestamp: today,
    });
  } catch (err) {
    return handleError(err);
  }
}
