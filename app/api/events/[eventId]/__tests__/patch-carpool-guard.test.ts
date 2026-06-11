import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  getSupabase: vi.fn(),
}));

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: vi.fn(),
}));

import { getSupabase } from "@/lib/supabase/client";

import { PATCH } from "../route";

// ─── helpers ───────────────────────────────────────────────────────────────

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/events/evt-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeParams(eventId = "evt-1") {
  return { params: Promise.resolve({ eventId }) };
}

// SupabaseClient is opaque 3rd-party type; building a full mock is impractical.
// Tests only exercise .from(), so we narrow via unknown to the partial shape we control.
function mockSupabase(fromImpl: (table: string) => unknown) {
  vi.mocked(getSupabase).mockReturnValue({
    from: fromImpl,
  } as unknown as SupabaseClient);
}

function makeAssignmentsChain(rows: { id: string }[]) {
  return {
    select: () => ({
      eq: () => Promise.resolve({ data: rows, error: null }),
    }),
  };
}

function makeEventSelectChain(
  row: { start_date: string; carpool_cutoff_days: number } | null
) {
  return {
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: row, error: null }),
      }),
    }),
  };
}

function makeEventSelectAndUpdateChain(
  row: { start_date: string; carpool_cutoff_days: number },
  updateResult: { data: unknown; error: unknown }
) {
  return {
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: row, error: null }),
      }),
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve(updateResult),
        }),
      }),
    }),
  };
}

function makeUpdateChain(result: { data: unknown; error: unknown }) {
  return {
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve(result),
        }),
      }),
    }),
  };
}

// ─── tests ─────────────────────────────────────────────────────────────────

describe("PATCH /api/events/[eventId] — carpool guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Guard 1：已有 carpool assignments 時禁止改 start_date / carpool_cutoff_days", () => {
    it("改 start_date（值確實不同）且 assignments 存在 → 400 CarpoolDatesLockedError", async () => {
      // Route fetches existing first; payload differs from existing to trigger guard.
      mockSupabase((table) => {
        if (table === "events")
          return makeEventSelectChain({
            start_date: "2099-06-01",
            carpool_cutoff_days: 3,
          });
        if (table === "carpool_assignments")
          return makeAssignmentsChain([{ id: "ca-1" }]);
        return {};
      });

      const res = await PATCH(
        makeRequest({ start_date: "2099-12-01" }),
        makeParams()
      );
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toMatch(/carpool assignments/i);
    });

    it("改 carpool_cutoff_days（值確實不同）且 assignments 存在 → 400 CarpoolDatesLockedError", async () => {
      mockSupabase((table) => {
        if (table === "events")
          return makeEventSelectChain({
            start_date: "2099-06-01",
            carpool_cutoff_days: 3,
          });
        if (table === "carpool_assignments")
          return makeAssignmentsChain([{ id: "ca-1" }]);
        return {};
      });

      const res = await PATCH(
        makeRequest({ carpool_cutoff_days: 2 }),
        makeParams()
      );
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toMatch(/carpool assignments/i);
    });

    it("assignments 為空且 start_date 真的變動 → 不觸發 Guard 1，繼續往下", async () => {
      // 今天 + 30 天當新 start_date，existing 是 +60 天，cutoff 3 天不會在過去
      const existing = new Date();
      existing.setDate(existing.getDate() + 60);
      const existingDate = existing.toISOString().slice(0, 10);

      const incoming = new Date();
      incoming.setDate(incoming.getDate() + 30);
      const incomingDate = incoming.toISOString().slice(0, 10);

      mockSupabase((table) => {
        if (table === "carpool_assignments") return makeAssignmentsChain([]);
        if (table === "events") {
          return makeEventSelectAndUpdateChain(
            { start_date: existingDate, carpool_cutoff_days: 3 },
            { data: { id: "evt-1", start_date: incomingDate }, error: null }
          );
        }
        return {};
      });

      const res = await PATCH(
        makeRequest({ start_date: incomingDate }),
        makeParams()
      );
      expect(res.status).toBe(200);
    });
  });

  describe("Guard 2：新 cutoffDate 不可在今天之前", () => {
    it("真的把 start_date 改到過去（新 cutoff < today）→ 400 CarpoolCutoffInPastError", async () => {
      // Existing start_date is far future; payload changes it to the past so value-diff fires.
      mockSupabase((table) => {
        if (table === "events")
          return makeEventSelectChain({
            start_date: "2099-06-01",
            carpool_cutoff_days: 3,
          });
        if (table === "carpool_assignments") return makeAssignmentsChain([]);
        return {};
      });

      const res = await PATCH(
        makeRequest({ start_date: "2020-01-10" }),
        makeParams()
      );
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toMatch(/past/i);
    });

    it("cutoffDate 恰好是今天 → 允許通過", async () => {
      // cutoffDate = today → not < today
      // Use local-date formatting to avoid UTC-vs-local midnight mismatch in UTC+8.
      const todayLocal = new Date();
      // cutoff_days = 3 → start_date must be today + 3 so cutoffDate lands on today
      const startLocal = new Date(
        todayLocal.getFullYear(),
        todayLocal.getMonth(),
        todayLocal.getDate() + 3
      );
      const sy = startLocal.getFullYear();
      const sm = String(startLocal.getMonth() + 1).padStart(2, "0");
      const sd = String(startLocal.getDate()).padStart(2, "0");
      const startDateStr = `${sy}-${sm}-${sd}`;

      // Existing has a different (earlier) start_date so value-diff triggers the guard.
      mockSupabase((table) => {
        if (table === "carpool_assignments") return makeAssignmentsChain([]);
        if (table === "events") {
          return makeEventSelectAndUpdateChain(
            { start_date: "2099-01-01", carpool_cutoff_days: 3 },
            { data: { id: "evt-1", start_date: startDateStr }, error: null }
          );
        }
        return {};
      });

      const res = await PATCH(
        makeRequest({ start_date: startDateStr }),
        makeParams()
      );
      expect(res.status).toBe(200);
    });

    it("cutoffDate 在未來 → 允許通過", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const startDate = futureDate.toISOString().slice(0, 10);

      // Existing has a different start_date so value-diff fires and guard is exercised.
      mockSupabase((table) => {
        if (table === "carpool_assignments") return makeAssignmentsChain([]);
        if (table === "events") {
          return makeEventSelectAndUpdateChain(
            { start_date: "2099-01-01", carpool_cutoff_days: 3 },
            { data: { id: "evt-1", start_date: startDate }, error: null }
          );
        }
        return {};
      });

      const res = await PATCH(
        makeRequest({ start_date: startDate }),
        makeParams()
      );
      expect(res.status).toBe(200);
    });

    it("只改不相關欄位（title）→ 跳過 guard，直接 update", async () => {
      mockSupabase((table) => {
        if (table === "events") {
          return makeUpdateChain({
            data: { id: "evt-1", title: "新標題" },
            error: null,
          });
        }
        return {};
      });

      const res = await PATCH(makeRequest({ title: "新標題" }), makeParams());
      expect(res.status).toBe(200);
    });

    it("existing event 不存在（fetch existing 查詢回 null）→ 404", async () => {
      mockSupabase((table) => {
        if (table === "events") return makeEventSelectChain(null);
        return {};
      });

      const res = await PATCH(
        makeRequest({ carpool_cutoff_days: 5 }),
        makeParams()
      );
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error).toMatch(/not found/i);
    });
  });

  describe("Guard：只有值真的改變時才觸發（SYW-070 修復）", () => {
    it("cutoff 已過的活動，payload 帶相同 start_date + description → 200 成功儲存", async () => {
      // start_date 在過去，cutoff 必然在過去；但因 start_date 值沒變，guard 不應觸發
      mockSupabase((table) => {
        if (table === "events") {
          return makeEventSelectAndUpdateChain(
            { start_date: "2020-01-10", carpool_cutoff_days: 3 },
            {
              data: {
                id: "evt-1",
                start_date: "2020-01-10",
                description: "新說明",
              },
              error: null,
            }
          );
        }
        return {};
      });

      const res = await PATCH(
        makeRequest({ start_date: "2020-01-10", description: "新說明" }),
        makeParams()
      );
      expect(res.status).toBe(200);
    });

    it("真的把 start_date 改到過去（新 cutoff < today）→ 400 CarpoolCutoffInPastError", async () => {
      // existing start_date 在未來，但 payload 改成過去的日期
      mockSupabase((table) => {
        if (table === "carpool_assignments") return makeAssignmentsChain([]);
        if (table === "events") {
          return makeEventSelectChain({
            start_date: "2099-06-01",
            carpool_cutoff_days: 3,
          });
        }
        return {};
      });

      const res = await PATCH(
        makeRequest({ start_date: "2020-01-10" }),
        makeParams()
      );
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toMatch(/past/i);
    });

    it("已存在 carpool_assignments 且 payload 真的改 start_date → 400 CarpoolDatesLockedError", async () => {
      // existing start_date 是 2099-06-01，payload 改成不同日期
      mockSupabase((table) => {
        if (table === "events")
          return makeEventSelectChain({
            start_date: "2099-06-01",
            carpool_cutoff_days: 3,
          });
        if (table === "carpool_assignments")
          return makeAssignmentsChain([{ id: "ca-1" }]);
        return {};
      });

      const res = await PATCH(
        makeRequest({ start_date: "2099-07-01" }),
        makeParams()
      );
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toMatch(/carpool assignments/i);
    });
  });
});
