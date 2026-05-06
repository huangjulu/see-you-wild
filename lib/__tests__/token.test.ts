import { describe, expect, it } from "vitest";

import { createAdminToken, createPaymentToken } from "@/lib/token";

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

const adminTokenizer = createAdminToken("test-secret-key-for-unit-tests");

describe("AdminToken", () => {
  it("generates a string token", () => {
    const token = adminTokenizer.generate("registration-id-123");
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("verifies a valid admin token", () => {
    const registrationId = "registration-id-123";
    const token = adminTokenizer.generate(registrationId);
    expect(adminTokenizer.verify(registrationId, token)).toBe(true);
  });

  it("rejects a token for wrong registration id", () => {
    const token = adminTokenizer.generate("registration-id-123");
    expect(adminTokenizer.verify("different-id", token)).toBe(false);
  });

  it("rejects a tampered token", () => {
    expect(adminTokenizer.verify("registration-id-123", "fake-token")).toBe(
      false
    );
  });

  it("rejects a token of mismatched length without throwing", () => {
    expect(adminTokenizer.verify("registration-id-123", "short")).toBe(false);
  });

  it("throws when secret is empty", () => {
    expect(() => createAdminToken("")).toThrow("TOKEN_SECRET must be set");
  });

  it("admin token 和 payment token 互不相通", () => {
    const registrationId = "registration-id-cross-check";
    const secret = "shared-secret-for-cross-check";
    const payment = createPaymentToken(secret);
    const admin = createAdminToken(secret);

    const paymentToken = payment.generate(registrationId);
    const adminToken = admin.generate(registrationId);

    // payment token 不能通過 admin verify
    expect(admin.verify(registrationId, paymentToken)).toBe(false);
    // admin token 不能通過 payment verify
    expect(payment.verify(registrationId, adminToken)).toBe(false);
  });
});
