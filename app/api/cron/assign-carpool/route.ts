import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { sendCarpoolRoleEmail } from "@/lib/email/send-carpool-role-email";
import { UnauthorizedError } from "@/lib/errors/domain";
import { assignCarpool } from "@/lib/services/carpool";
import { getSupabase } from "@/lib/supabase/client";

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
        "id, title, start_date, carpool_cutoff_days, driver_refund_per_passenger"
      )
      .eq("status", "open");

    if (eventsError) {
      throw new Error(eventsError.message);
    }

    const targetEvents = (events ?? []).filter((event) => {
      const startDate = new Date(event.start_date);
      const cutoffDate = new Date(startDate);
      cutoffDate.setDate(cutoffDate.getDate() - event.carpool_cutoff_days);
      return cutoffDate.toISOString().slice(0, 10) === today;
    });

    const results: Array<{ eventId: string; assigned: number }> = [];

    for (const event of targetEvents) {
      const assignments = await assignCarpool(event.id);

      const registrationIds = assignments.map((a) => a.registration_id);

      if (registrationIds.length > 0) {
        const { data: registrations } = await getSupabase()
          .from("registrations")
          .select("id, name, email, pickup_location")
          .in("id", registrationIds);

        const regMap = new Map((registrations ?? []).map((r) => [r.id, r]));

        for (const assignment of assignments) {
          const reg = regMap.get(assignment.registration_id);
          if (!reg) continue;

          const role: "driver" | "passenger" =
            assignment.final_role === "driver" ? "driver" : "passenger";

          sendCarpoolRoleEmail({
            to: reg.email,
            customerName: reg.name,
            eventTitle: event.title,
            eventStartDate: event.start_date,
            role,
            pickupLocation: reg.pickup_location ?? assignment.pickup_location,
            refundAmount: assignment.refund_amount,
            carGroup: assignment.car_group,
          }).catch(console.error);
        }
      }

      results.push({ eventId: event.id, assigned: assignments.length });
    }

    return apiOk({ processed: targetEvents.length, results });
  } catch (err) {
    return handleError(err);
  }
}
