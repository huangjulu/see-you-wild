-- ============================================
-- See You Wild — Registration + Carpool Schema
-- Spec: docs/specs/2026-03-31-registration-carpool-db-design.md
-- ============================================

-- Events
CREATE TABLE events (
  id                text PRIMARY KEY,
  type              text NOT NULL,
  location          text NOT NULL,
  title             text NOT NULL,
  start_date        date NOT NULL,
  end_date          date NOT NULL,
  base_price        integer NOT NULL,
  carpool_surcharge integer NOT NULL,
  payment_days      integer NOT NULL,
  min_participants  integer NOT NULL DEFAULT 3,
  status            text NOT NULL DEFAULT 'open',
  first_created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT events_status_check CHECK (status IN ('open', 'closed')),
  CONSTRAINT events_date_check CHECK (end_date >= start_date),
  CONSTRAINT events_price_check CHECK (base_price > 0 AND carpool_surcharge > 0),
  CONSTRAINT events_payment_days_check CHECK (payment_days > 0)
);

-- Registrations
CREATE TABLE registrations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        text NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  name            text NOT NULL,
  email           text NOT NULL,
  phone           text NOT NULL,
  line_id         text,
  gender          text NOT NULL,
  id_number       text NOT NULL,
  birthday        date NOT NULL,

  emergency_contact_name   text NOT NULL,
  emergency_contact_phone  text NOT NULL,

  dietary         text NOT NULL,
  wants_rental    boolean NOT NULL DEFAULT false,
  notes           text,

  transport       text NOT NULL,
  pickup_location text,
  carpool_role    text,
  seat_count      integer,

  amount_due      integer NOT NULL,
  payment_ref     text,

  status          text NOT NULL DEFAULT 'pending',

  created_at      timestamptz NOT NULL DEFAULT now(),
  confirmed_at    timestamptz,
  expires_at      timestamptz NOT NULL,

  CONSTRAINT registrations_gender_check CHECK (gender IN ('male', 'female', 'other')),
  CONSTRAINT registrations_dietary_check CHECK (dietary IN ('omnivore', 'no_beef', 'vegetarian', 'vegan')),
  CONSTRAINT registrations_transport_check CHECK (transport IN ('self', 'carpool')),
  CONSTRAINT registrations_status_check CHECK (status IN ('pending', 'paid')),
  CONSTRAINT registrations_seat_count_check CHECK (seat_count BETWEEN 3 AND 5),
  CONSTRAINT registrations_carpool_role_check CHECK (carpool_role IN ('passenger', 'driver')),
  CONSTRAINT registrations_carpool_fields CHECK (
    (transport = 'self' AND pickup_location IS NULL AND carpool_role IS NULL AND seat_count IS NULL)
    OR
    (transport = 'carpool' AND pickup_location IS NOT NULL AND carpool_role IS NOT NULL)
  ),
  CONSTRAINT registrations_driver_seat_check CHECK (
    carpool_role != 'driver' OR seat_count IS NOT NULL
  )
);

CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_expires_at ON registrations(expires_at);

-- Carpool Assignments
CREATE TABLE carpool_assignments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  car_group       integer NOT NULL,
  pickup_location text NOT NULL,
  registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  final_role      text NOT NULL,
  refund_amount   integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT carpool_final_role_check CHECK (final_role IN ('driver', 'passenger')),
  CONSTRAINT carpool_refund_check CHECK (refund_amount >= 0),
  CONSTRAINT carpool_unique_registration UNIQUE (registration_id)
);

CREATE INDEX idx_carpool_event_id ON carpool_assignments(event_id);
