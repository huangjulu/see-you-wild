type LineAudienceEnvironment = Readonly<Record<string, string | undefined>>;

const LINE_USER_ID_PATTERN = /^U[0-9a-f]{32}$/;

// 預設只開給管理者名單。只有精確設為 open 才對所有好友開放，
// 未設或打錯字一律當 admin：開放必須是明確的一次決定，不能靠清空名單或手滑生效。
export function isLineAudience(
  lineUserId: string | undefined,
  environment: LineAudienceEnvironment = process.env
): boolean {
  if (!lineUserId) return false;
  if (environment.LINE_AUDIENCE === "open") return true;
  return parseAdminUserIds(environment.LINE_ADMIN_USER_IDS).has(lineUserId);
}

// 任一項不合法整份作廢：半壞的名單比空名單更難察覺，寧可全擋讓封測一開始就發現設錯
function parseAdminUserIds(raw: string | undefined): Set<string> {
  if (!raw) return new Set();
  const ids = raw.split(",").map((id) => id.trim());
  if (ids.some((id) => !LINE_USER_ID_PATTERN.test(id))) return new Set();
  return new Set(ids);
}
