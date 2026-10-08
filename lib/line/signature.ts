import { createHmac, timingSafeEqual } from "crypto";

// LINE 簽章 = Base64(HMAC-SHA256(channel secret, raw body))。
// 必須拿 raw body 原文驗——parse 後再 stringify 會因 key 順序/空白差異而必定不符。
export function verifyLineSignature(
  rawBody: string,
  signature: string,
  channelSecret: string
): boolean {
  const expected = createHmac("sha256", channelSecret).update(rawBody).digest();
  const provided = Buffer.from(signature, "base64");
  // timingSafeEqual 遇長度不同會 throw，先擋
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(expected, provided);
}
