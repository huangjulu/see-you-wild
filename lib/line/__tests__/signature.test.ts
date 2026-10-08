import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";

import { verifyLineSignature } from "@/lib/line/signature";

const secret = "test-secret";
const body = '{"events":[]}';
const validSignature = createHmac("sha256", secret)
  .update(body)
  .digest("base64");

describe("verifyLineSignature", () => {
  it("正確簽章回 true", () => {
    expect(verifyLineSignature(body, validSignature, secret)).toBe(true);
  });

  it("body 被改過回 false", () => {
    expect(verifyLineSignature(body + " ", validSignature, secret)).toBe(false);
  });

  it("簽章長度不同回 false 不 throw", () => {
    expect(verifyLineSignature(body, "c2hvcnQ=", secret)).toBe(false);
  });
});
