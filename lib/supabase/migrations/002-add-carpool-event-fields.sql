ALTER TABLE events
  ADD COLUMN driver_refund_per_passenger integer NOT NULL DEFAULT 0,
  ADD COLUMN carpool_cutoff_days integer NOT NULL DEFAULT 3;

ALTER TABLE events
  ADD CONSTRAINT events_driver_refund_check CHECK (driver_refund_per_passenger >= 0),
  ADD CONSTRAINT events_cutoff_days_check CHECK (carpool_cutoff_days >= 1);
