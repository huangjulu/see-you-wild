-- SYW-069: 修復報名失敗 — pickup_location CHECK constraint 對不上中文值
--
-- 背景：commit fca2d92 把前端 / Zod / PICKUP_LOCATIONS 的 pickup_location
-- 統一改成中文格式（大坪林捷運站…），但 registrations_pickup_location_check
-- 這條 DB constraint（SYW-040 當初直接在 Supabase 建立、未進版控）仍鎖在
-- 舊的 slug 值（taipei / nangang / dapinglin / sanchong / banqiao），
-- 導致選共乘 + 任一上車地點報名時違反 check constraint、無法報名。
--
-- 修法：移除舊 constraint，重建為與 lib/constants.ts PICKUP_LOCATIONS 對齊的中文值。
-- 值來源：lib/constants.ts 的 PICKUP_LOCATIONS。

ALTER TABLE registrations
  DROP CONSTRAINT IF EXISTS registrations_pickup_location_check;

ALTER TABLE registrations
  ADD CONSTRAINT registrations_pickup_location_check
  CHECK (
    pickup_location IS NULL
    OR pickup_location IN (
      '大坪林捷運站',
      '南港捷運站',
      '台北車站',
      '板橋捷運站',
      '三重捷運站'
    )
  );
