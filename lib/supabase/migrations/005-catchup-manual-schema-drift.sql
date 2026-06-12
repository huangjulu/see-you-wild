-- ============================================
-- 005 — Catch-up：把曾直接在 Supabase 手動建立、未進版控的 schema 補進 migrations
-- ============================================
-- 背景：程式碼（lib/types/database.ts、lib/services/registrations.ts、cron routes）
-- 依賴以下欄位 / 約束 / 索引，但 001-004 均未涵蓋——migration 004 註解已自承
-- SYW-040 時期有物件「直接在 Supabase 建立、未進版控」。
-- 缺少這份檔案時，任何新環境重建（新 Supabase project、災難復原）會少掉
-- 防重複報名 index 與 failed 狀態，造成靜默資料損壞。
--
-- ⚠️ 對既有 production DB 為 no-op（全部 IF NOT EXISTS / 冪等重建）。
--    套用前請先跑 `supabase db diff` 核對：欄位型別與 DEFAULT 為依程式碼行為
--    之最佳重建，若 diff 顯示 live DB 型別不同，以 live DB 為準修正本檔。

-- ---------- event_types（整張表未進版控；EventTypeRow / /api/event-types 依賴） ----------
CREATE TABLE IF NOT EXISTS event_types (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text NOT NULL UNIQUE,
  name_zh    text NOT NULL,
  name_en    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- events：EventRow 有、migrations 沒有的欄位 ----------
-- jsonb 型別依據：seed-journey-events.sql 以 JSON 字串插入這些欄位
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS description       text  NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS pickup_locations  jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS images            jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS available_dates   jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS safety_policy     text  NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS preparation_notes text  NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS faq               text  NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS refund_policy     text  NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS carpool_enabled   boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS rental_enabled    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_sent_at  timestamptz;

-- ---------- registrations：RegistrationRow 有、migrations 沒有的欄位 ----------
ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS rental_details jsonb,
  ADD COLUMN IF NOT EXISTS selected_date  date;

-- ---------- status CHECK：程式碼會寫入 'failed'（admin 審核退回），001 只允許 pending/paid ----------
ALTER TABLE registrations
  DROP CONSTRAINT IF EXISTS registrations_status_check;
ALTER TABLE registrations
  ADD CONSTRAINT registrations_status_check
  CHECK (status IN ('pending', 'paid', 'failed'));

-- ---------- 防重複報名 unique index ----------
-- 程式碼以 error.message 含 'registrations_event_email' 判定 23505 → AlreadyRegisteredError，
-- index 名稱不可改。lower(email) 對齊 Zod 輸入層的 .toLowerCase() 正規化
-- （見 lib/validations/registrations.ts 頂部註解）。
CREATE UNIQUE INDEX IF NOT EXISTS registrations_event_email_idx
  ON registrations (event_id, lower(email));

-- ---------- 備註 ----------
-- registrations.wants_rental（001 建立）已不被程式碼使用，語意被 rental_details 取代。
-- 確認 live DB 無殘留依賴後可另開 migration 移除：
-- ALTER TABLE registrations DROP COLUMN wants_rental;
