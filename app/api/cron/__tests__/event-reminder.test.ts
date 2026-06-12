import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  getSupabase: vi.fn(),
}));

vi.mock("@/lib/services/carpool", () => ({
  assignCarpool: vi.fn(),
}));

vi.mock("@/lib/email/send-event-reminder-email", () => ({
  sendEventReminderEmail: vi.fn(),
}));

vi.mock("@/lib/email/send-admin-carpool-summary-email", () => ({
  sendAdminCarpoolSummaryEmail: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getEnv: vi.fn().mockReturnValue({
    canonicalUrl: "https://seeyouwild.com",
    RESEND_FROM: "noreply@seeyouwild.com",
    RESEND_API_KEY: "re_test",
  }),
}));

import { sendAdminCarpoolSummaryEmail } from "@/lib/email/send-admin-carpool-summary-email";
import { sendEventReminderEmail } from "@/lib/email/send-event-reminder-email";
import { assignCarpool } from "@/lib/services/carpool";
import { getSupabase } from "@/lib/supabase/client";

import { POST } from "../event-reminder/route";

function makeRequest(secret: string): Request {
  return new Request("http://localhost/api/cron/event-reminder", {
    method: "POST",
    headers: { authorization: `Bearer ${secret}` },
  });
}

const openEvent = {
  id: "evt-1",
  title: "宜蘭一日遊",
  start_date: "2026-05-28",
  location: "宜蘭",
  status: "open",
  carpool_cutoff_days: 3,
  reminder_sent_at: null,
};

const paidRegistration = {
  id: "reg-1",
  name: "張小明",
  email: "user@example.com",
  transport: "carpool",
  seat_count: null,
};

const driverRegistration = {
  id: "reg-2",
  name: "李大華",
  email: "driver@example.com",
  transport: "carpool",
  seat_count: 4,
};

function makeChain(result: { data: unknown; error: unknown }) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockResolvedValue(result),
    update: vi.fn().mockReturnThis(),
  };
  return chain;
}

describe("POST /api/cron/event-reminder", () => {
  let originalCronSecret: string | undefined;
  let originalAdminEmail: string | undefined;

  beforeEach(() => {
    originalCronSecret = process.env.CRON_SECRET;
    originalAdminEmail = process.env.ADMIN_EMAIL;
    process.env.CRON_SECRET = "test-secret";
    process.env.ADMIN_EMAIL = "admin@test.com";
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalCronSecret;
    process.env.ADMIN_EMAIL = originalAdminEmail;
  });

  it("CRON_SECRET 不符時回 401", async () => {
    const res = await POST(makeRequest("wrong-secret"));
    expect(res.status).toBe(401);
  });

  it("沒有符合條件的活動時回 200 + processed 0", async () => {
    const eventsChain = makeChain({ data: [], error: null });

    // SupabaseClient is opaque 3rd-party type; only .from() is used in route.
    vi.mocked(getSupabase).mockReturnValue({
      from: vi.fn().mockReturnValue(eventsChain),
    } as unknown as SupabaseClient);

    const res = await POST(makeRequest("test-secret"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.processed).toBe(0);
    expect(body.results).toEqual([]);
  });

  it("有符合條件的活動時跑配車 + 寄信 + 更新 reminder_sent_at", async () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const eligibleEvent = {
      ...openEvent,
      start_date: todayStr,
      carpool_cutoff_days: 0,
    };

    const assignments = [
      {
        event_id: "evt-1",
        car_group: 1,
        pickup_location: "台北",
        registration_id: "reg-2",
        final_role: "driver",
        refund_amount: 400,
      },
      {
        event_id: "evt-1",
        car_group: 1,
        pickup_location: "台北",
        registration_id: "reg-1",
        final_role: "passenger",
        refund_amount: 0,
      },
    ];

    vi.mocked(assignCarpool).mockResolvedValue(assignments);

    // claim-first：update().eq().is().select() 回已搶占的列
    const claimChain = {
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      select: vi
        .fn()
        .mockResolvedValue({ data: [{ id: "evt-1" }], error: null }),
    };

    let callCount = 0;
    const fromMock = vi.fn().mockImplementation((table: string) => {
      if (table === "events") {
        callCount++;
        if (callCount === 1) {
          return makeChain({ data: [eligibleEvent], error: null });
        }
        return { update: vi.fn().mockReturnValue(claimChain) };
      }
      if (table === "registrations") {
        const regChain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
        };
        // Second .eq() resolves the chain
        let eqCount = 0;
        regChain.eq = vi.fn().mockImplementation(() => {
          eqCount++;
          if (eqCount >= 2) {
            return Promise.resolve({
              data: [paidRegistration, driverRegistration],
              error: null,
            });
          }
          return regChain;
        });
        return regChain;
      }
      return makeChain({ data: null, error: null });
    });

    // SupabaseClient is opaque 3rd-party type; only .from() is used in route.
    vi.mocked(getSupabase).mockReturnValue({
      from: fromMock,
    } as unknown as SupabaseClient);

    const res = await POST(makeRequest("test-secret"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.processed).toBe(1);
    expect(body.results[0].status).toBe("ok");

    expect(assignCarpool).toHaveBeenCalledWith("evt-1");
    expect(sendEventReminderEmail).toHaveBeenCalledTimes(2);
    expect(sendAdminCarpoolSummaryEmail).toHaveBeenCalledTimes(1);

    const adminCall = vi.mocked(sendAdminCarpoolSummaryEmail).mock.calls[0][0];
    expect(adminCall.to).toBe("admin@test.com");
    expect(adminCall.groups).toHaveLength(1);
    expect(adminCall.groups[0].driverName).toBe("李大華");
    expect(adminCall.groups[0].seatCount).toBe(4);
    expect(adminCall.groups[0].passengerCount).toBe(1);
    expect(adminCall.groups[0].remainingSeats).toBe(3);
  });

  it("單一活動失敗時不影響其他活動處理", async () => {
    const todayStr = new Date().toISOString().slice(0, 10);

    const event1 = {
      ...openEvent,
      id: "evt-fail",
      start_date: todayStr,
      carpool_cutoff_days: 0,
    };
    const event2 = {
      ...openEvent,
      id: "evt-ok",
      start_date: todayStr,
      carpool_cutoff_days: 0,
    };

    vi.mocked(assignCarpool).mockImplementation((eventId: string) => {
      if (eventId === "evt-fail") {
        return Promise.reject(new Error("carpool explosion"));
      }
      return Promise.resolve([]);
    });

    const claimChain = {
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      select: vi
        .fn()
        .mockResolvedValue({ data: [{ id: "evt-ok" }], error: null }),
    };

    let eventsCallCount = 0;
    const fromMock = vi.fn().mockImplementation((table: string) => {
      if (table === "events") {
        eventsCallCount++;
        if (eventsCallCount === 1) {
          return makeChain({ data: [event1, event2], error: null });
        }
        return { update: vi.fn().mockReturnValue(claimChain) };
      }
      if (table === "registrations") {
        const regChain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
        };
        let eqCount = 0;
        regChain.eq = vi.fn().mockImplementation(() => {
          eqCount++;
          if (eqCount >= 2) {
            return Promise.resolve({ data: [], error: null });
          }
          return regChain;
        });
        return regChain;
      }
      return makeChain({ data: null, error: null });
    });

    // SupabaseClient is opaque 3rd-party type; only .from() is used in route.
    vi.mocked(getSupabase).mockReturnValue({
      from: fromMock,
    } as unknown as SupabaseClient);

    const res = await POST(makeRequest("test-secret"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.processed).toBe(2);

    const failResult = body.results.find(
      (r: ProcessResult) => r.eventId === "evt-fail"
    );
    const okResult = body.results.find(
      (r: ProcessResult) => r.eventId === "evt-ok"
    );

    expect(failResult.status).toBe("error");
    expect(failResult.error).toContain("carpool explosion");
    expect(okResult.status).toBe("ok");
  });
});

interface ProcessResult {
  eventId: string;
  status: "ok" | "error";
  error?: string;
}
