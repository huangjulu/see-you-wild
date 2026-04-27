import { describe, it, expect } from "vitest";
import { createPaymentToken } from "@/lib/token";

const tokenizer = createPaymentToken("test-secret-key-for-unit-tests");

describe("PaymentToken", () => {
  it("generates a string token", () => {
    const token = tokenizer.generate("registration-id-123");
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("verifies a valid token", () => {
    const registrationId = "registration-id-123";
    const token = tokenizer.generate(registrationId);
    expect(tokenizer.verify(registrationId, token)).toBe(true);
  });

  it("rejects a token for wrong registration id", () => {
    const token = tokenizer.generate("registration-id-123");
    expect(tokenizer.verify("different-id", token)).toBe(false);
  });

  it("rejects a tampered token", () => {
    expect(tokenizer.verify("registration-id-123", "fake-token")).toBe(false);
  });

  it("rejects a token of mismatched length without throwing", () => {
    expect(tokenizer.verify("registration-id-123", "short")).toBe(false);
  });

  it("throws when secret is empty", () => {
    expect(() => createPaymentToken("")).toThrow("TOKEN_SECRET must be set");
  });
});
