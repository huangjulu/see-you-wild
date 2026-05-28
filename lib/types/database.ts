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

export interface EventTypeRow {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  created_at: string;
}

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
  description: string;
  pickup_locations: string[];
  images: Array<{ src: string; alt: string }>;
  available_dates: string[];
  safety_policy: string;
  preparation_notes: string;
  faq: string;
  refund_policy: string;
  status: EventStatus;
  first_created_at: string;
  reminder_sent_at: string | null;
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
  selected_date: string | null;
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

// PATCH /api/events/{eventId} → request body
export type EventUpdateDto = Partial<Omit<EventRow, "id" | "first_created_at">>;

// DELETE /api/events/{eventId} → request body
export interface EventDeleteDto {
  cancellation_reason: string;
}

// GET /api/events → response item
export interface EventListDto extends EventRow {
  registrations: RegistrationAdminDto[];
}

// GET /events/[id] → public detail page (Server Component)
export interface EventDetailDto {
  id: string;
  type: string;
  location: string;
  title: string;
  startDate: string;
  endDate: string;
  basePrice: number;
  carpoolSurcharge: number;
  description: string;
  safetyPolicy: string;
  preparationNotes: string;
  faq: string;
  refundPolicy: string;
  images: Array<{ src: string; alt: string }>;
  availableDates: string[];
  paymentDays: number;
}

export function toEventDetail(row: EventRow): EventDetailDto {
  return {
    id: row.id,
    type: row.type,
    location: row.location,
    title: row.title,
    startDate: row.start_date,
    endDate: row.end_date,
    basePrice: row.base_price,
    carpoolSurcharge: row.carpool_surcharge,
    description: row.description,
    safetyPolicy: row.safety_policy,
    preparationNotes: row.preparation_notes,
    faq: row.faq,
    refundPolicy: row.refund_policy,
    images: row.images,
    availableDates: row.available_dates,
    paymentDays: row.payment_days,
  };
}

// GET /events → public listing page (Server Component)
export interface EventListingItem {
  id: string;
  type: string;
  typeLabel: string;
  location: string;
  title: string;
  startDate: string;
  endDate: string;
  basePrice: number;
  status: EventStatus;
  image: string | null;
  imageAlt: string;
}

export function toEventListingItem(
  row: EventRow,
  typeMap?: Map<string, { name_zh: string; name_en: string }>
): EventListingItem {
  const firstImage = row.images[0];
  const typeEntry = typeMap?.get(row.type);
  return {
    id: row.id,
    type: row.type,
    typeLabel: typeEntry?.name_zh ?? row.type,
    location: row.location,
    title: row.title,
    startDate: row.start_date,
    endDate: row.end_date,
    basePrice: row.base_price,
    status: row.status,
    image: firstImage?.src ?? null,
    imageAlt: firstImage?.alt ?? "",
  };
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
  selected_date: string | null;
  created_at: string;
}

// GET /api/events → nested in EventListDto (admin-expanded fields)
export interface RegistrationAdminDto extends RegistrationSummaryDto {
  email: string;
  phone: string;
  amount_due: number;
  event_id: string;
}

// PATCH /api/registrations/{id}/payment-ref → request body
export interface RegistrationPaymentRefDto {
  payment_ref: string;
  token: string;
}

// --- Carpool ---

// GET /api/events/{eventId}/carpool-assignments → response item
export type CarpoolAssignmentDetailDto = CarpoolAssignmentRow;
