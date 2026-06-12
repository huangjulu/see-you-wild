import { createHmac, timingSafeEqual } from "crypto";

/**
 * Build a HMAC-SHA256 token signer/verifier bound to a specific secret.
 * Returns two closures sharing the captured secret:
 *   - generate  produces a hex digest for a registration id
 *   - verify    checks an incoming token in constant time
 *
 * Tests inject a deterministic secret instead of stubbing process.env.
 */
export function createPaymentToken(secret: string) {
  if (!secret) {
    throw new Error("TOKEN_SECRET must be set");
  }

  function generate(registrationId: string): string {
    return createHmac("sha256", secret).update(registrationId).digest("hex");
  }

  function verify(registrationId: string, token: string): boolean {
    const expected = generate(registrationId);
    const expectedBuf = Buffer.from(expected, "utf8");
    const tokenBuf = Buffer.from(token, "utf8");
    if (expectedBuf.length !== tokenBuf.length) return false;
    return timingSafeEqual(expectedBuf, tokenBuf);
  }

  return { generate, verify };
}

/** Admin review token 預設效期：7 天，涵蓋正常審核週期後自動失效 */
const ADMIN_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Admin token 格式：`${expiresAtMs}.${hmac}`，HMAC 內容綁定 registrationId 與
 * 過期時間戳。過期戳記納入簽章，竄改 exp 會使簽章失效；review URL 外洩後
 * 最多有效至 exp，不再永久可用。
 */
export function createAdminToken(secret: string) {
  if (!secret) {
    throw new Error("TOKEN_SECRET must be set");
  }

  function sign(registrationId: string, expiresAtMs: number): string {
    return createHmac("sha256", secret)
      .update(`admin:${registrationId}:${expiresAtMs}`)
      .digest("hex");
  }

  function generate(
    registrationId: string,
    ttlMs: number = ADMIN_TOKEN_TTL_MS
  ): string {
    const expiresAtMs = Date.now() + ttlMs;
    return `${expiresAtMs}.${sign(registrationId, expiresAtMs)}`;
  }

  function verify(registrationId: string, token: string): boolean {
    const separatorIndex = token.indexOf(".");
    if (separatorIndex === -1) return false;

    const expiresPart = token.slice(0, separatorIndex);
    const signaturePart = token.slice(separatorIndex + 1);

    // regex 驗證後才轉數字，避免 Number() 對任意輸入產生 NaN 的 silent failure
    if (!/^\d{1,15}$/.test(expiresPart)) return false;
    const expiresAtMs = Number(expiresPart);
    if (expiresAtMs < Date.now()) return false;

    const expected = sign(registrationId, expiresAtMs);
    const expectedBuf = Buffer.from(expected, "utf8");
    const signatureBuf = Buffer.from(signaturePart, "utf8");
    if (expectedBuf.length !== signatureBuf.length) return false;
    return timingSafeEqual(expectedBuf, signatureBuf);
  }

  return { generate, verify };
}

let _runtime: ReturnType<typeof createPaymentToken> | undefined;
let _adminRuntime: ReturnType<typeof createAdminToken> | undefined;

/**
 * Lazy runtime singleton bound to process.env.TOKEN_SECRET.
 * Initialized on first call so the env variable is read at runtime, not build time.
 */
export function getPaymentToken() {
  if (_runtime == null) {
    _runtime = createPaymentToken(process.env.TOKEN_SECRET ?? "");
  }
  return _runtime;
}

export function getAdminToken() {
  if (_adminRuntime == null) {
    _adminRuntime = createAdminToken(process.env.TOKEN_SECRET ?? "");
  }
  return _adminRuntime;
}
