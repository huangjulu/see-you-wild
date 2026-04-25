import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/lib/supabase/client", () => ({
  getSupabase: vi.fn(),
}));

vi.mock("@/lib/token", () => ({
  paymentToken: vi.fn(),
}));

import { getSupabase } from "@/lib/supabase/client";
import { paymentToken } from "@/lib/token";
import {
  createRegistrationService,
  submitPaymentRef,
} from "@/lib/services/registrations";
import {
  EventClosedError,
  EventNotFoundError,
  InternalError,
  InvalidTokenError,
  RegistrationExpiredError,
  RegistrationNotFoundError,
  RegistrationPaidError,
} from "@/lib/errors/domain";
import type { EventRow } from "@/lib/types/database";

const baseEvent: EventRow = {
  id: "evt-1",
  type: "trip",
  location: "宜蘭",
  title: "Test event",
  start_date: "2026-05-01",
  end_date: "2026-05-02",
  base_price: 1000,
  carpool_surcharge: 100,
  payment_days: 7,
  min_participants: 4,
  status: "open",
  first_created_at: "2026-04-01T00:00:00Z",
};

function makeSingleChain(result: { data: unknown; error: unknown }) {
  return {
    select: () => ({
      eq: () => ({
        single: vi.fn().mockResolvedValue(result),
      }),
    }),
  };
}

function makeUpdateChain(result: { error: unknown }) {
  return {
    update: () => ({
      eq: vi.fn().mockResolvedValue(result),
    }),
  };
}

function setupSupabaseMock(chains: unknown[]) {
  const fromMock = vi.fn();
  for (const chain of chains) {
    fromMock.mockReturnValueOnce(chain);
  }
  // SupabaseClient is opaque 3rd-party type; building a full mock is impractical.
  // submitPaymentRef only uses .from(), so we narrow via unknown to the partial shape we control.
  vi.mocked(getSupabase).mockReturnValue({
    from: fromMock,
  } as unknown as SupabaseClient);
}

function setupPaymentToken(verifyResult: boolean) {
  // PaymentToken returned by paymentToken() exposes more methods than tests use;
  // we only need .verify(), narrowing via unknown is acceptable for mock setup.
  vi.mocked(paymentToken).mockReturnValue({
    verify: vi.fn().mockReturnValue(verifyResult),
  } as unknown as ReturnType<typeof paymentToken>);
}

describe("createRegistrationService", () => {
  it("isOpen() 在 event.status='open' 時回 true", () => {
    const service = createRegistrationService(baseEvent);
    expect(service.isOpen()).toBe(true);
  });

  it("isOpen() 在 event.status='closed' 時回 false", () => {
    const service = createRegistrationService({
      ...baseEvent,
      status: "closed",
    });
    expect(service.isOpen()).toBe(false);
  });

  it("calculateAmountDue('self') 回 base_price", () => {
    const service = createRegistrationService(baseEvent);
    expect(service.calculateAmountDue("self")).toBe(1000);
  });

  it("calculateAmountDue('carpool') 回 base_price + carpool_surcharge", () => {
    const service = createRegistrationService(baseEvent);
    expect(service.calculateAmountDue("carpool")).toBe(1100);
  });

  it("calculateExpiresAt() 回今天 + payment_days 天", () => {
    const service = createRegistrationService(baseEvent);
    const before = new Date();
    const expires = service.calculateExpiresAt();
    const after = new Date();

    const beforeExpected = new Date(before);
    beforeExpected.setDate(beforeExpected.getDate() + 7);
    const afterExpected = new Date(after);
    afterExpected.setDate(afterExpected.getDate() + 7);

    expect(expires.getTime()).toBeGreaterThanOrEqual(beforeExpected.getTime());
    expect(expires.getTime()).toBeLessThanOrEqual(afterExpected.getTime());
  });
});

describe("submitPaymentRef", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("token 合法 + registration pending + event open → 成功更新", async () => {
    setupPaymentToken(true);

    const futureDate = new Date(Date.now() + 7 * 86400_000).toISOString();

    setupSupabaseMock([
      makeSingleChain({
        data: { status: "pending", expires_at: futureDate, event_id: "evt-1" },
        error: null,
      }),
      makeSingleChain({
        data: { status: "open" },
        error: null,
      }),
      makeUpdateChain({ error: null }),
    ]);

    const result = await submitPaymentRef({
      registrationId: "reg-1",
      token: "valid-token",
      paymentRef: "12345",
    });

    expect(result).toEqual({
      registrationId: "reg-1",
      paymentRef: "12345",
    });
  });

  it("HMAC token 無效時 throw InvalidTokenError 不查 DB", async () => {
    setupPaymentToken(false);

    await expect(
      submitPaymentRef({
        registrationId: "reg-1",
        token: "bad-token",
        paymentRef: "12345",
      })
    ).rejects.toThrow(InvalidTokenError);
  });

  it("registration 不存在時 throw RegistrationNotFoundError", async () => {
    setupPaymentToken(true);
    setupSupabaseMock([
      makeSingleChain({ data: null, error: { message: "not found" } }),
    ]);

    await expect(
      submitPaymentRef({
        registrationId: "reg-not-exist",
        token: "valid-token",
        paymentRef: "12345",
      })
    ).rejects.toThrow(RegistrationNotFoundError);
  });

  it("registration.status='paid' 時 throw RegistrationPaidError", async () => {
    setupPaymentToken(true);

    const futureDate = new Date(Date.now() + 7 * 86400_000).toISOString();

    setupSupabaseMock([
      makeSingleChain({
        data: { status: "paid", expires_at: futureDate, event_id: "evt-1" },
        error: null,
      }),
    ]);

    await expect(
      submitPaymentRef({
        registrationId: "reg-1",
        token: "valid-token",
        paymentRef: "12345",
      })
    ).rejects.toThrow(RegistrationPaidError);
  });

  it("registration.expires_at 已過期時 throw RegistrationExpiredError", async () => {
    setupPaymentToken(true);

    const pastDate = new Date(Date.now() - 86400_000).toISOString();

    setupSupabaseMock([
      makeSingleChain({
        data: { status: "pending", expires_at: pastDate, event_id: "evt-1" },
        error: null,
      }),
    ]);

    await expect(
      submitPaymentRef({
        registrationId: "reg-1",
        token: "valid-token",
        paymentRef: "12345",
      })
    ).rejects.toThrow(RegistrationExpiredError);
  });

  it("event 不存在時 throw EventNotFoundError", async () => {
    setupPaymentToken(true);

    const futureDate = new Date(Date.now() + 7 * 86400_000).toISOString();

    setupSupabaseMock([
      makeSingleChain({
        data: { status: "pending", expires_at: futureDate, event_id: "evt-1" },
        error: null,
      }),
      makeSingleChain({ data: null, error: { message: "event not found" } }),
    ]);

    await expect(
      submitPaymentRef({
        registrationId: "reg-1",
        token: "valid-token",
        paymentRef: "12345",
      })
    ).rejects.toThrow(EventNotFoundError);
  });

  it("event.status !== 'open' 時 throw EventClosedError", async () => {
    setupPaymentToken(true);

    const futureDate = new Date(Date.now() + 7 * 86400_000).toISOString();

    setupSupabaseMock([
      makeSingleChain({
        data: { status: "pending", expires_at: futureDate, event_id: "evt-1" },
        error: null,
      }),
      makeSingleChain({ data: { status: "closed" }, error: null }),
    ]);

    await expect(
      submitPaymentRef({
        registrationId: "reg-1",
        token: "valid-token",
        paymentRef: "12345",
      })
    ).rejects.toThrow(EventClosedError);
  });

  it("DB update 失敗時 throw InternalError", async () => {
    setupPaymentToken(true);

    const futureDate = new Date(Date.now() + 7 * 86400_000).toISOString();

    setupSupabaseMock([
      makeSingleChain({
        data: { status: "pending", expires_at: futureDate, event_id: "evt-1" },
        error: null,
      }),
      makeSingleChain({ data: { status: "open" }, error: null }),
      makeUpdateChain({ error: { message: "update failed" } }),
    ]);

    await expect(
      submitPaymentRef({
        registrationId: "reg-1",
        token: "valid-token",
        paymentRef: "12345",
      })
    ).rejects.toThrow(InternalError);
  });
});
