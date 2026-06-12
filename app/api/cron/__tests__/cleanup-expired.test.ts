import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  getSupabase: vi.fn(),
}));

import { getSupabase } from "@/lib/supabase/client";

import { POST } from "../cleanup-expired/route";

function makeRequest(secret: string): Request {
  return new Request("http://localhost/api/cron/cleanup-expired", {
    method: "POST",
    headers: { authorization: `Bearer ${secret}` },
  });
}

function makeDeleteChain(result: { data: unknown; error: unknown }) {
  return {
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    select: vi.fn().mockResolvedValue(result),
  };
}

function setupSupabaseMock(chain: unknown) {
  // SupabaseClient is opaque 3rd-party type; route only uses .from().
  vi.mocked(getSupabase).mockReturnValue({
    from: vi.fn().mockReturnValue(chain),
  } as unknown as SupabaseClient);
}

describe("POST /api/cron/cleanup-expired", () => {
  let originalCronSecret: string | undefined;

  beforeEach(() => {
    originalCronSecret = process.env.CRON_SECRET;
    process.env.CRON_SECRET = "test-secret";
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalCronSecret;
  });

  it("CRON_SECRET 不符時回 401，不碰 DB", async () => {
    const chain = makeDeleteChain({ data: [], error: null });
    setupSupabaseMock(chain);

    const res = await POST(makeRequest("wrong-secret"));

    expect(res.status).toBe(401);
    expect(chain.delete).not.toHaveBeenCalled();
  });

  it("刪除條件必須同時鎖定 pending + payment_ref 為 null + 已過期（SYW-036 I6：不誤刪已回報待審核的報名）", async () => {
    const chain = makeDeleteChain({
      data: [{ id: "r1" }, { id: "r2" }],
      error: null,
    });
    setupSupabaseMock(chain);

    const res = await POST(makeRequest("test-secret"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.deleted).toBe(2);
    expect(chain.eq).toHaveBeenCalledWith("status", "pending");
    expect(chain.is).toHaveBeenCalledWith("payment_ref", null);
    expect(chain.lt).toHaveBeenCalledWith("expires_at", expect.any(String));
  });

  it("沒有過期報名時回 deleted 0", async () => {
    setupSupabaseMock(makeDeleteChain({ data: [], error: null }));

    const res = await POST(makeRequest("test-secret"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.deleted).toBe(0);
  });

  it("DB 錯誤時回 500", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    setupSupabaseMock(
      makeDeleteChain({ data: null, error: { message: "boom" } })
    );

    const res = await POST(makeRequest("test-secret"));

    expect(res.status).toBe(500);
    consoleSpy.mockRestore();
  });
});
