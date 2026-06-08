import type { EventRow, RegistrationRow } from "@/lib/types/database";

const BASE_EVENT: EventRow = {
  id: "evt-1",
  type: "trip",
  location: "宜蘭",
  title: "Test event",
  start_date: "2026-05-01",
  end_date: "2026-05-02",
  base_price: 1000,
  carpool_surcharge: 100,
  driver_refund_per_passenger: 200,
  payment_days: 7,
  carpool_cutoff_days: 3,
  min_participants: 4,
  description: "",
  pickup_locations: [],
  images: [],
  available_dates: ["2026-05-01", "2026-05-02"],
  safety_policy: "",
  preparation_notes: "",
  faq: "",
  refund_policy: "",
  carpool_enabled: true,
  rental_enabled: false,
  status: "open",
  first_created_at: "2026-04-01T00:00:00Z",
  reminder_sent_at: null,
};

const BASE_REGISTRATION: RegistrationRow = {
  id: "reg-default",
  event_id: "evt-1",
  country: "TW",
  name: "Test User",
  email: "test@example.com",
  phone: "0900000000",
  line_id: null,
  gender: "other",
  id_number: "A123456789",
  birthday: "1990-01-01",
  emergency_contact_name: "Em",
  emergency_contact_phone: "0911111111",
  dietary: "omnivore",
  rental_details: null,
  notes: null,
  transport: "carpool",
  pickup_location: "台北",
  carpool_role: "passenger",
  seat_count: null,
  guardian_consent: null,
  amount_due: 1100,
  payment_ref: null,
  status: "paid",
  selected_date: null,
  created_at: "2026-04-01T00:00:00Z",
  confirmed_at: "2026-04-02T00:00:00Z",
  expires_at: "2026-04-08T00:00:00Z",
};

export function makeEvent(overrides?: Partial<EventRow>): EventRow {
  return { ...BASE_EVENT, ...overrides };
}

export function makeRegistration(
  overrides?: Partial<RegistrationRow>
): RegistrationRow {
  return { ...BASE_REGISTRATION, ...overrides };
}
