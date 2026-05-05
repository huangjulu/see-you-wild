// ============================================
// Database row types — match SQL schema exactly
// ============================================

export type EventStatus = "open" | "closed";
export type Gender = "male" | "female" | "other";
export type Dietary = "omnivore" | "no_beef" | "vegetarian" | "vegan";
export type Transport = "self" | "carpool";
export type CarpoolRole = "passenger" | "driver";
export type RegistrationStatus = "pending" | "paid" | "failed";
export type FinalRole = "driver" | "passenger";

export interface EventRow {
  id: string;
  type: string;
  location: string;
  title: string;
  start_date: string;
  end_date: string;
  base_price: number;
  carpool_surcharge: number;
  driver_refund_per_passenger: number;
  payment_days: number;
  carpool_cutoff_days: number;
  min_participants: number;
  status: EventStatus;
  first_created_at: string;
}

export interface RegistrationRow {
  id: string;
  event_id: string;
  country: string;
  name: string;
  email: string;
  phone: string;
  line_id: string | null;
  gender: Gender;
  id_number: string;
  birthday: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  dietary: Dietary;
  wants_rental: boolean;
  notes: string | null;
  transport: Transport;
  pickup_location: string | null;
  carpool_role: CarpoolRole | null;
  seat_count: number | null;
  guardian_consent: boolean | null;
  amount_due: number;
  payment_ref: string | null;
  status: RegistrationStatus;
  created_at: string;
  confirmed_at: string | null;
  expires_at: string;
}

export interface CarpoolAssignmentRow {
  id: string;
  event_id: string;
  car_group: number;
  pickup_location: string;
  registration_id: string;
  final_role: FinalRole;
  refund_amount: number;
  created_at: string;
}

// ============================================
// DTOs — {DtoName}{Action}Dto
// ============================================

// --- Event ---

// POST /api/events → request body
export type EventCreateDto = Omit<EventRow, "first_created_at">;

// GET /api/events → response item
export interface EventListDto extends EventRow {
  registrations: RegistrationSummaryDto[];
}

// --- Registration ---

// POST /api/registrations → request body
export type RegistrationCreateDto = Omit<
  RegistrationRow,
  | "id"
  | "amount_due"
  | "payment_ref"
  | "status"
  | "created_at"
  | "confirmed_at"
  | "expires_at"
>;

// GET /api/registrations/{id} → response
export type RegistrationDetailDto = RegistrationRow;

// PATCH /api/registrations/{id} → request body
export type RegistrationUpdateDto = Partial<RegistrationCreateDto> & {
  status?: RegistrationStatus;
};

// GET /api/events/{eventId}/registrations → response item
// GET /api/events → nested in EventListDto
export interface RegistrationSummaryDto {
  id: string;
  name: string;
  status: RegistrationStatus;
  transport: Transport;
  payment_ref: string | null;
  created_at: string;
}

// PATCH /api/registrations/{id}/payment-ref → request body
export interface RegistrationPaymentRefDto {
  payment_ref: string;
  token: string;
}

// --- Carpool ---

// GET /api/events/{eventId}/carpool-assignments → response item
export type CarpoolAssignmentDetailDto = CarpoolAssignmentRow;
