-- 同一活動不允許相同證件號碼重複報名（email 已有 registrations_event_email_idx）。
-- lower() 對齊 id_number 的 trim().toUpperCase() Zod transform。
CREATE UNIQUE INDEX IF NOT EXISTS registrations_event_id_number_idx
  ON registrations (event_id, lower(id_number));
