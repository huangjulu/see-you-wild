export interface PackageSelection {
  selectedDate: string | null;
  transport: "self" | "carpool";
  carpoolRole: "driver" | "passenger" | null;
  selectedPickup: string | null;
  seatCount: number | null;
}
