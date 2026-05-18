import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  getSupabase: vi.fn(),
}));

vi.mock("@/lib/email/send-registration-cancelled-email", () => ({
  sendRegistrationCancelledEmail: vi.fn(),
}));

vi.mock("@/lib/services/registrations", () => ({
  deleteRegistration: vi.fn(),
}));

import { PATCH } from "@/app/api/registrations/[id]/route";
import { getSupabase } from "@/lib/supabase/client";

// SupabaseClient is opaque 3rd-party type; building a full mock is impractical.
// PATCH only uses .from(), so we narrow via unknown to the partial shape we control.
function setupSupabaseMock(chains: unknown[]) {
  const fromMock = vi.fn();
  for (const chain of chains) {
    fromMock.mockReturnValueOnce(chain);
  }
  vi.mocked(getSupabase).mockReturnValue({
    from: fromMock,
  } as unknown as SupabaseClient);
}

function makeSelectSingleChain(result: { data: unknown; error: unknown }) {
  return {
    select: () => ({
      eq: () => ({
        single: vi.fn().mockResolvedValue(result),
      }),
    }),
  };
}

function makeUpdateSelectSingleChain(result: {
  data: unknown;
  error: unknown;
}) {
  return {
    update: () => ({
      eq: () => ({
        select: () => ({
          single: vi.fn().mockResolvedValue(result),
        }),
      }),
    }),
  };
}

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/registrations/reg-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const params = Promise.resolve({ id: "reg-1" });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PATCH /api/registrations/[id] — carpool guard", () => {
  describe("Guard 1: carpool → self 禁止", () => {
    it("現有 transport=carpool，嘗試改成 self → 400", async () => {
      setupSupabaseMock([
        makeSelectSingleChain({
          data: { transport: "carpool", event_id: "evt-1" },
          error: null,
        }),
      ]);

      const res = await PATCH(makeRequest({ transport: "self" }), { params });

      expect(res.status).toBe(400);
      const json = (await res.json()) as { error: string };
      expect(json.error).toMatch(/carpool/i);
    });

    it("現有 transport=self，改成 self → 不觸發 guard 1", async () => {
      setupSupabaseMock([
        makeSelectSingleChain({
          data: { transport: "self", event_id: "evt-1" },
          error: null,
        }),
        makeUpdateSelectSingleChain({
          data: { id: "reg-1", transport: "self" },
          error: null,
        }),
      ]);

      const res = await PATCH(makeRequest({ transport: "self" }), { params });

      expect(res.status).toBe(200);
    });
  });

  describe("Guard 2: self → carpool 必填驗證", () => {
    it("self → carpool 但缺 carpool_role → 400", async () => {
      setupSupabaseMock([
        makeSelectSingleChain({
          data: { transport: "self", event_id: "evt-1" },
          error: null,
        }),
      ]);

      const res = await PATCH(
        makeRequest({ transport: "carpool", pickup_location: "台北車站" }),
        { params }
      );

      expect(res.status).toBe(400);
      const json = (await res.json()) as { error: string };
      expect(json.error).toMatch(/carpool_role/i);
    });

    it("self → carpool 但缺 pickup_location → 400", async () => {
      setupSupabaseMock([
        makeSelectSingleChain({
          data: { transport: "self", event_id: "evt-1" },
          error: null,
        }),
      ]);

      const res = await PATCH(
        makeRequest({ transport: "carpool", carpool_role: "passenger" }),
        { params }
      );

      expect(res.status).toBe(400);
      const json = (await res.json()) as { error: string };
      expect(json.error).toMatch(/pickup_location/i);
    });

    it("self → carpool 且 carpool_role + pickup_location 都有 → 成功", async () => {
      setupSupabaseMock([
        makeSelectSingleChain({
          data: { transport: "self", event_id: "evt-1" },
          error: null,
        }),
        makeUpdateSelectSingleChain({
          data: { id: "reg-1", transport: "carpool" },
          error: null,
        }),
      ]);

      const res = await PATCH(
        makeRequest({
          transport: "carpool",
          carpool_role: "passenger",
          pickup_location: "台北車站",
        }),
        { params }
      );

      expect(res.status).toBe(200);
    });
  });

  describe("Guard 3: carpool 偏好欄位受 cutoff 限制", () => {
    it("今天 >= cutoff 日期，修改 carpool_role → 400", async () => {
      // start_date 明天，cutoff_days=10 → cutoff 是 10 天前，today >= cutoff → 鎖定
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const startDate = tomorrow.toISOString().slice(0, 10);

      setupSupabaseMock([
        makeSelectSingleChain({
          data: { transport: "carpool", event_id: "evt-1" },
          error: null,
        }),
        {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValue({
                data: { start_date: startDate, carpool_cutoff_days: 10 },
                error: null,
              }),
            }),
          }),
        },
      ]);

      const res = await PATCH(makeRequest({ carpool_role: "driver" }), {
        params,
      });

      expect(res.status).toBe(400);
      const json = (await res.json()) as { error: string };
      expect(json.error).toMatch(/cutoff/i);
    });

    it("today < cutoff 日期，修改 pickup_location → 成功", async () => {
      // start_date 60 天後，cutoff_days=3 → cutoff 是 57 天後，today < cutoff → 允許
      const future = new Date();
      future.setDate(future.getDate() + 60);
      const startDate = future.toISOString().slice(0, 10);

      setupSupabaseMock([
        makeSelectSingleChain({
          data: { transport: "carpool", event_id: "evt-1" },
          error: null,
        }),
        {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValue({
                data: { start_date: startDate, carpool_cutoff_days: 3 },
                error: null,
              }),
            }),
          }),
        },
        makeUpdateSelectSingleChain({
          data: { id: "reg-1", pickup_location: "板橋站" },
          error: null,
        }),
      ]);

      const res = await PATCH(makeRequest({ pickup_location: "板橋站" }), {
        params,
      });

      expect(res.status).toBe(200);
    });

    it("transport=self 修改 carpool 偏好欄位 → 不觸發 cutoff guard", async () => {
      // transport=self：guard 3 不啟動（只對 existing carpool 生效）
      setupSupabaseMock([
        makeSelectSingleChain({
          data: { transport: "self", event_id: "evt-1" },
          error: null,
        }),
        makeUpdateSelectSingleChain({
          data: { id: "reg-1", carpool_role: null },
          error: null,
        }),
      ]);

      const res = await PATCH(makeRequest({ carpool_role: "passenger" }), {
        params,
      });

      // 不觸發 guard，但 self→carpool 的 guard 2 也不觸發（parsed.transport 是 undefined）
      expect(res.status).toBe(200);
    });

    it("現有 transport=carpool，修改非 carpool 欄位 → 不觸發 cutoff guard", async () => {
      setupSupabaseMock([
        makeSelectSingleChain({
          data: { transport: "carpool", event_id: "evt-1" },
          error: null,
        }),
        makeUpdateSelectSingleChain({
          data: { id: "reg-1", notes: "備注" },
          error: null,
        }),
      ]);

      const res = await PATCH(makeRequest({ notes: "備注" }), { params });

      expect(res.status).toBe(200);
    });
  });

  describe("registration 不存在", () => {
    it("SELECT 回 error → 404", async () => {
      setupSupabaseMock([
        makeSelectSingleChain({
          data: null,
          error: { message: "not found" },
        }),
      ]);

      const res = await PATCH(makeRequest({ notes: "hi" }), { params });

      expect(res.status).toBe(404);
    });
  });
});
