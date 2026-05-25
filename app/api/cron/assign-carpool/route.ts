import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { sendCarpoolRoleEmail } from "@/lib/email/send-carpool-role-email";
import { UnauthorizedError } from "@/lib/errors/domain";
import { assignCarpool } from "@/lib/services/carpool";
import { getSupabase } from "@/lib/supabase/client";

export async function GET(request: Request) {
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
      return cutoffDate.toISOString().slice(0, 10) <= today;
    });

    const results: Array<{ eventId: string; assigned: number }> = [];

    for (const event of targetEvents) {
      const assignments = await assignCarpool(event.id);

      const { data: unnotified } = await getSupabase()
        .from("carpool_assignments")
        .select(
          "id, car_group, pickup_location, registration_id, final_role, refund_amount"
        )
        .eq("event_id", event.id)
        .is("notified_at", null);

      if (!unnotified || unnotified.length === 0) {
        results.push({ eventId: event.id, assigned: assignments.length });
        continue;
      }

      const regIds = unnotified.map((a) => a.registration_id);
      const { data: regs } = await getSupabase()
        .from("registrations")
        .select("id, name, email, pickup_location")
        .in("id", regIds);
      const regMap = new Map((regs ?? []).map((r) => [r.id, r]));

      const groupedByCarGroup = new Map<number, typeof unnotified>();
      for (const a of unnotified) {
        const group = groupedByCarGroup.get(a.car_group) ?? [];
        group.push(a);
        groupedByCarGroup.set(a.car_group, group);
      }

      const overflowGroups = new Set<number>();
      for (const [carGroup, members] of groupedByCarGroup) {
        if (!members.some((m) => m.final_role === "driver")) {
          overflowGroups.add(carGroup);
        }
      }

      for (const assignment of unnotified) {
        const reg = regMap.get(assignment.registration_id);
        if (!reg) continue;

        try {
          await sendCarpoolRoleEmail({
            to: reg.email,
            customerName: reg.name,
            eventTitle: event.title,
            eventStartDate: event.start_date,
            role: assignment.final_role === "driver" ? "driver" : "passenger",
            pickupLocation: reg.pickup_location ?? assignment.pickup_location,
            refundAmount: assignment.refund_amount,
            carGroup: assignment.car_group,
            isOverflow: overflowGroups.has(assignment.car_group),
          });

          await getSupabase()
            .from("carpool_assignments")
            .update({ notified_at: new Date().toISOString() })
            .eq("id", assignment.id);
        } catch (err) {
          console.error(`Failed to notify ${reg.email}:`, err);
        }
      }

      results.push({ eventId: event.id, assigned: assignments.length });
    }

    return apiOk({ processed: targetEvents.length, results });
  } catch (err) {
    return handleError(err);
  }
}
