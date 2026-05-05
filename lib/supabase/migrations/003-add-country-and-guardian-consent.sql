-- ============================================
-- Add country and guardian_consent columns to registrations
-- ============================================
-- country: ISO whitelist drives id_number validation (TW = national ID, others = passport)
-- guardian_consent: required when registrant is under 18 at submission time
-- DEFAULT 'TW' backfills existing rows; new schema requires NOT NULL.

ALTER TABLE registrations
  ADD COLUMN country TEXT NOT NULL DEFAULT 'TW',
  ADD COLUMN guardian_consent BOOLEAN NULL;

ALTER TABLE registrations
  ADD CONSTRAINT registrations_country_check
  CHECK (country IN (
    'TW','HK','MO','CN','JP','KR','SG','MY','US',
    'UK','FR','DE','IT','ES','NL','CH','SE'
  ));
