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

let _runtime: ReturnType<typeof createPaymentToken> | undefined;

/**
 * Lazy runtime singleton bound to process.env.TOKEN_SECRET.
 * Initialized on first call so the env variable is read at runtime, not build time.
 */
export function paymentToken() {
  if (_runtime == null) {
    _runtime = createPaymentToken(process.env.TOKEN_SECRET ?? "");
  }
  return _runtime;
}
