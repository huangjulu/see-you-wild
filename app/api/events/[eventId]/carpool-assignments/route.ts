import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import type { RegistrationRow, EventRow } from "@/lib/types/database";

interface RouteParams {
  params: Promise<{ eventId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { eventId } = await params;

  const { data, error } = await supabase
    .from("carpool_assignments")
    .select("*, registrations(name, email, phone)")
    .eq("event_id", eventId)
    .order("car_group", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(_request: Request, { params }: RouteParams) {
  const { eventId } = await params;

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const typedEvent = event as EventRow;

  const { data: registrations, error: regError } = await supabase
    .from("registrations")
    .select("*")
    .eq("event_id", eventId)
    .eq("status", "paid")
    .eq("transport", "carpool");

  if (regError) {
    return NextResponse.json({ error: regError.message }, { status: 500 });
  }

  const carpoolRegs = (registrations ?? []) as RegistrationRow[];

  if (carpoolRegs.length === 0) {
    return NextResponse.json(
      { message: "No carpool registrations to assign" },
      { status: 200 }
    );
  }

  await supabase.from("carpool_assignments").delete().eq("event_id", eventId);

  const byLocation = new Map<string, RegistrationRow[]>();
  for (const reg of carpoolRegs) {
    const loc = reg.pickup_location!;
    if (!byLocation.has(loc)) byLocation.set(loc, []);
    byLocation.get(loc)!.push(reg);
  }

  const assignments: Array<{
    event_id: string;
    car_group: number;
    pickup_location: string;
    registration_id: string;
    final_role: string;
    refund_amount: number;
  }> = [];

  let carGroupCounter = 1;

  for (const [location, regs] of byLocation) {
    const drivers = regs.filter((r) => r.carpool_role === "driver");
    const passengers = regs.filter((r) => r.carpool_role === "passenger");

    if (drivers.length > 0) {
      const selectedDriver = drivers.sort(
        (a, b) => (b.seat_count ?? 0) - (a.seat_count ?? 0)
      )[0];

      const seatCount = selectedDriver.seat_count ?? 3;
      const allPassengers = [
        ...drivers.filter((d) => d.id !== selectedDriver.id),
        ...passengers,
      ];

      let remaining = [...allPassengers];

      while (remaining.length > 0 || carGroupCounter === 1) {
        const group = remaining.splice(0, seatCount);

        assignments.push({
          event_id: eventId,
          car_group: carGroupCounter,
          pickup_location: location,
          registration_id: selectedDriver.id,
          final_role: "driver",
          refund_amount: (seatCount + 1) * typedEvent.carpool_surcharge,
        });

        for (const passenger of group) {
          assignments.push({
            event_id: eventId,
            car_group: carGroupCounter,
            pickup_location: location,
            registration_id: passenger.id,
            final_role: "passenger",
            refund_amount: 0,
          });
        }

        carGroupCounter++;

        if (remaining.length === 0) break;
      }
    } else {
      for (const passenger of regs) {
        assignments.push({
          event_id: eventId,
          car_group: carGroupCounter,
          pickup_location: location,
          registration_id: passenger.id,
          final_role: "passenger",
          refund_amount: 0,
        });
      }
      carGroupCounter++;
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from("carpool_assignments")
    .insert(assignments)
    .select();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json(inserted, { status: 201 });
}
