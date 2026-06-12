import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  getSupabase: vi.fn(),
}));

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/email/send-registration-cancelled-email", () => ({
  sendRegistrationCancelledEmail: vi.fn(),
}));

vi.mock("@/lib/services/registrations", () => ({
  deleteRegistration: vi.fn(),
}));

import { requireAdmin } from "@/lib/auth/require-admin";
import { UnauthorizedError } from "@/lib/errors/domain";
import { getSupabase } from "@/lib/supabase/client";

import { PATCH } from "../route";

// SupabaseClient is opaque 3rd-party type; PATCH only uses .from(),
// so we narrow via unknown to the partial shape we control.
function setupSupabaseMock(chains: unknown[]) {
  const fromMock = vi.fn();
  for (const chain of chains) {
    fromMock.mockReturnValueOnce(chain);
  }
  vi.mocked(getSupabase).mockReturnValue({
    from: fromMock,
  } as unknown as SupabaseClient);
  return fromMock;
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

function makeCapturingUpdateChain(
  capture: (row: Record<string, unknown>) => void,
  result: { data: unknown; error: unknown }
) {
  return {
    update: (row: Record<string, unknown>) => {
      capture(row);
      return {
        eq: () => ({
          select: () => ({
            single: vi.fn().mockResolvedValue(result),
          }),
        }),
      };
    },
  };
}

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/admin/registrations/reg-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const params = Promise.resolve({ id: "reg-1" });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PATCH /api/admin/registrations/[id] — carpool guard", () => {
  it("requireAdmin 失敗 → 401，不碰 DB", async () => {
    vi.mocked(requireAdmin).mockRejectedValueOnce(new UnauthorizedError());
    const fromMock = setupSupabaseMock([]);

    const res = await PATCH(makeRequest({ notes: "hi" }), { params });

    expect(res.status).toBe(401);
    expect(fromMock).not.toHaveBeenCalled();
  });

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
      const json = await res.json();
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
      const json = await res.json();
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
      const json = await res.json();
      expect(json.error).toMatch(/pickup_location/i);
    });

    it("self → carpool 且必填齊全 → 成功", async () => {
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
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const startDate = tomorrow.toISOString().slice(0, 10);

      setupSupabaseMock([
        makeSelectSingleChain({
          data: { transport: "carpool", event_id: "evt-1" },
          error: null,
        }),
        makeSelectSingleChain({
          data: { start_date: startDate, carpool_cutoff_days: 10 },
          error: null,
        }),
      ]);

      const res = await PATCH(makeRequest({ carpool_role: "driver" }), {
        params,
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/cutoff/i);
    });

    it("today < cutoff 日期，修改 pickup_location → 成功", async () => {
      const future = new Date();
      future.setDate(future.getDate() + 60);
      const startDate = future.toISOString().slice(0, 10);

      setupSupabaseMock([
        makeSelectSingleChain({
          data: { transport: "carpool", event_id: "evt-1" },
          error: null,
        }),
        makeSelectSingleChain({
          data: { start_date: startDate, carpool_cutoff_days: 3 },
          error: null,
        }),
        makeUpdateSelectSingleChain({
          data: { id: "reg-1", pickup_location: "板橋捷運站" },
          error: null,
        }),
      ]);

      const res = await PATCH(makeRequest({ pickup_location: "板橋捷運站" }), {
        params,
      });

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

  describe("status 審核副作用", () => {
    it("status='paid' 時 update payload 寫入 confirmed_at", async () => {
      let captured: Record<string, unknown> = {};

      setupSupabaseMock([
        makeSelectSingleChain({
          data: { transport: "self", event_id: "evt-1" },
          error: null,
        }),
        makeCapturingUpdateChain(
          (row) => {
            captured = row;
          },
          { data: { id: "reg-1", status: "paid" }, error: null }
        ),
      ]);

      const res = await PATCH(makeRequest({ status: "paid" }), { params });

      expect(res.status).toBe(200);
      expect(captured.status).toBe("paid");
      expect(captured.confirmed_at).toBeTypeOf("string");
    });

    it("status='pending' 時不寫 confirmed_at", async () => {
      let captured: Record<string, unknown> = {};

      setupSupabaseMock([
        makeSelectSingleChain({
          data: { transport: "self", event_id: "evt-1" },
          error: null,
        }),
        makeCapturingUpdateChain(
          (row) => {
            captured = row;
          },
          { data: { id: "reg-1", status: "pending" }, error: null }
        ),
      ]);

      const res = await PATCH(makeRequest({ status: "pending" }), { params });

      expect(res.status).toBe(200);
      expect(captured.confirmed_at).toBeUndefined();
    });
  });

  describe("registration 不存在", () => {
    it("SELECT 回 error → 404", async () => {
      setupSupabaseMock([
        makeSelectSingleChain({ data: null, error: { message: "not found" } }),
      ]);

      const res = await PATCH(makeRequest({ notes: "hi" }), { params });

      expect(res.status).toBe(404);
    });
  });
});
