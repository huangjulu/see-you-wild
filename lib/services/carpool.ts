import { getSupabase } from "@/lib/supabase/client";
import { ok, fail, type ServiceResult } from "./result";
import type { EventRow, RegistrationRow } from "@/lib/types/database";

interface CarpoolAssignment {
  event_id: string;
  car_group: number;
  pickup_location: string;
  registration_id: string;
  final_role: string;
  refund_amount: number;
}

/**
 * Group carpool registrations into car groups by pickup location.
 *
 * Algorithm (SYW-036 C2):
 *   - One driver belongs to at most one car_group, never duplicated across groups.
 *   - Each location's drivers are sorted by seat_count desc; the largest one drives,
 *     remaining drivers fall back to passenger role in the same group.
 *   - Passengers exceeding the driver's seat count spill into a driverless car_group
 *     marked for manual arrangement.
 *   - A location with passengers but no driver also produces a driverless group.
 */
export async function assignCarpool(
  eventId: string
): Promise<ServiceResult<CarpoolAssignment[]>> {
  // ─── Load event ─────────────────────────────────────────────
  const { data: event, error: eventError } = await getSupabase()
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return fail("Event not found", 404);
  }
  const typedEvent = event as EventRow;

  // ─── Load carpool registrations ─────────────────────────────
  const { data: registrations, error: regError } = await getSupabase()
    .from("registrations")
    .select("*")
    .eq("event_id", eventId)
    .eq("status", "paid")
    .eq("transport", "carpool");

  if (regError) {
    return fail(regError.message, 500);
  }

  const carpoolRegs = (registrations ?? []) as RegistrationRow[];
  if (carpoolRegs.length === 0) {
    return ok([]);
  }

  // ─── Reset previous assignments ─────────────────────────────
  const { error: deleteError } = await getSupabase()
    .from("carpool_assignments")
    .delete()
    .eq("event_id", eventId);

  if (deleteError) {
    return fail(deleteError.message, 500);
  }

  // ─── Build assignments per location ────────────────────────
  const assignments = buildAssignments(eventId, typedEvent, carpoolRegs);

  // ─── Persist ───────────────────────────────────────────────
  const { data: inserted, error: insertError } = await getSupabase()
    .from("carpool_assignments")
    .insert(assignments)
    .select();

  if (insertError) {
    return fail(insertError.message, 500);
  }

  return ok((inserted ?? []) as CarpoolAssignment[]);
}

export function buildAssignments(
  eventId: string,
  event: EventRow,
  carpoolRegs: RegistrationRow[]
): CarpoolAssignment[] {
  const byLocation = groupByLocation(carpoolRegs);
  const assignments: CarpoolAssignment[] = [];
  let carGroup = 1;

  for (const [location, regs] of byLocation) {
    const drivers = regs
      .filter((r) => r.carpool_role === "driver")
      .sort((a, b) => (b.seat_count ?? 0) - (a.seat_count ?? 0));
    const passengers = regs.filter((r) => r.carpool_role === "passenger");

    if (drivers.length === 0) {
      // No driver at this location — every passenger waits for manual arrangement.
      for (const p of passengers) {
        assignments.push(makePassenger(eventId, carGroup, location, p));
      }
      carGroup += 1;
      continue;
    }

    // The largest-capacity driver leads; surplus drivers are demoted to passengers.
    const lead = drivers[0];
    const seatCount = lead.seat_count ?? 3;
    const queue = [...drivers.slice(1), ...passengers];
    const groupPassengers = queue.splice(0, seatCount);

    assignments.push(
      makeDriver(eventId, carGroup, location, lead, seatCount, event)
    );
    for (const p of groupPassengers) {
      assignments.push(makePassenger(eventId, carGroup, location, p));
    }
    carGroup += 1;

    // Anyone who didn't fit goes to a driverless overflow group.
    if (queue.length > 0) {
      for (const p of queue) {
        assignments.push(makePassenger(eventId, carGroup, location, p));
      }
      carGroup += 1;
    }
  }

  return assignments;
}

function groupByLocation(
  regs: RegistrationRow[]
): Map<string, RegistrationRow[]> {
  const byLocation = new Map<string, RegistrationRow[]>();
  for (const reg of regs) {
    const loc = reg.pickup_location;
    if (loc == null) continue;
    if (!byLocation.has(loc)) byLocation.set(loc, []);
    byLocation.get(loc)!.push(reg);
  }
  return byLocation;
}

function makeDriver(
  eventId: string,
  carGroup: number,
  location: string,
  driver: RegistrationRow,
  seatCount: number,
  event: EventRow
): CarpoolAssignment {
  return {
    event_id: eventId,
    car_group: carGroup,
    pickup_location: location,
    registration_id: driver.id,
    final_role: "driver",
    refund_amount: (seatCount + 1) * event.carpool_surcharge,
  };
}

function makePassenger(
  eventId: string,
  carGroup: number,
  location: string,
  passenger: RegistrationRow
): CarpoolAssignment {
  return {
    event_id: eventId,
    car_group: carGroup,
    pickup_location: location,
    registration_id: passenger.id,
    final_role: "passenger",
    refund_amount: 0,
  };
}
