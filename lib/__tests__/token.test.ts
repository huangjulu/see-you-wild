import { describe, expect, it } from "vitest";

import { createAdminToken, createPaymentToken } from "@/lib/token";

const TEST_SECRET = "test-secret-key-for-hmac";

describe("createPaymentToken", () => {
  it("secret 為空字串時 throw", () => {
    expect(() => createPaymentToken("")).toThrow("TOKEN_SECRET must be set");
  });

  it("generate 回傳 hex 字串", () => {
    const token = createPaymentToken(TEST_SECRET);
    const hex = token.generate("reg-1");
    expect(hex).toMatch(/^[0-9a-f]{64}$/);
  });

  it("同一 registrationId 產出相同 token（確定性）", () => {
    const token = createPaymentToken(TEST_SECRET);
    expect(token.generate("reg-1")).toBe(token.generate("reg-1"));
  });

  it("不同 registrationId 產出不同 token", () => {
    const token = createPaymentToken(TEST_SECRET);
    expect(token.generate("reg-1")).not.toBe(token.generate("reg-2"));
  });

  it("generate 的 token 能被 verify 通過", () => {
    const token = createPaymentToken(TEST_SECRET);
    const hex = token.generate("reg-1");
    expect(token.verify("reg-1", hex)).toBe(true);
  });

  it("篡改 registrationId 後 verify 失敗", () => {
    const token = createPaymentToken(TEST_SECRET);
    const hex = token.generate("reg-1");
    expect(token.verify("reg-2", hex)).toBe(false);
  });

  it("篡改 token 內容後 verify 失敗", () => {
    const token = createPaymentToken(TEST_SECRET);
    const hex = token.generate("reg-1");
    const tampered = hex.slice(0, -1) + (hex.endsWith("0") ? "1" : "0");
    expect(token.verify("reg-1", tampered)).toBe(false);
  });

  it("完全不同長度的 token verify 失敗（length check 分支）", () => {
    const token = createPaymentToken(TEST_SECRET);
    expect(token.verify("reg-1", "short")).toBe(false);
  });

  it("不同 secret 產出不同 token", () => {
    const a = createPaymentToken("secret-a");
    const b = createPaymentToken("secret-b");
    expect(a.generate("reg-1")).not.toBe(b.generate("reg-1"));
  });

  it("不同 secret 的 token 互相 verify 失敗", () => {
    const a = createPaymentToken("secret-a");
    const b = createPaymentToken("secret-b");
    const tokenFromA = a.generate("reg-1");
    expect(b.verify("reg-1", tokenFromA)).toBe(false);
  });
});

describe("createAdminToken", () => {
  it("secret 為空字串時 throw", () => {
    expect(() => createAdminToken("")).toThrow("TOKEN_SECRET must be set");
  });

  it("generate 的 token 能被 verify 通過", () => {
    const token = createAdminToken(TEST_SECRET);
    const hex = token.generate("reg-1");
    expect(token.verify("reg-1", hex)).toBe(true);
  });

  it("admin token 與 payment token 不同（不同 prefix）", () => {
    const payment = createPaymentToken(TEST_SECRET);
    const admin = createAdminToken(TEST_SECRET);
    expect(payment.generate("reg-1")).not.toBe(admin.generate("reg-1"));
  });

  it("payment token 不能通過 admin verify（反之亦然）", () => {
    const payment = createPaymentToken(TEST_SECRET);
    const admin = createAdminToken(TEST_SECRET);
    const paymentHex = payment.generate("reg-1");
    const adminHex = admin.generate("reg-1");
    expect(admin.verify("reg-1", paymentHex)).toBe(false);
    expect(payment.verify("reg-1", adminHex)).toBe(false);
  });
});
