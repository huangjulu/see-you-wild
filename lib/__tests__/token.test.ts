import { describe, it, expect, vi } from "vitest";

vi.stubEnv("TOKEN_SECRET", "test-secret-key-for-unit-tests");

import { generateToken, verifyToken } from "@/lib/token";

describe("token", () => {
  it("generates a string token", () => {
    const token = generateToken("registration-id-123");
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("verifies a valid token", () => {
    const registrationId = "registration-id-123";
    const token = generateToken(registrationId);
    expect(verifyToken(registrationId, token)).toBe(true);
  });

  it("rejects a token for wrong registration id", () => {
    const token = generateToken("registration-id-123");
    expect(verifyToken("different-id", token)).toBe(false);
  });

  it("rejects a tampered token", () => {
    expect(verifyToken("registration-id-123", "fake-token")).toBe(false);
  });
});
