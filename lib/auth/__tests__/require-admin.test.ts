import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  getEnv: () => ({ NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co" }),
}));

vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ getAll: () => [] }),
}));

const mockGetUser = vi.fn();
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser: mockGetUser } }),
}));

import { InternalError, UnauthorizedError } from "@/lib/errors/domain";

import { requireAdmin } from "../require-admin";

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  });

  it("未登入（getUser 回 null）時拋 UnauthorizedError", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    await expect(requireAdmin()).rejects.toThrow(UnauthorizedError);
  });

  it("已登入（getUser 回 user）時正常通過", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    await expect(requireAdmin()).resolves.toBeUndefined();
  });

  it("缺少 NEXT_PUBLIC_SUPABASE_ANON_KEY 時拋 InternalError", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    await expect(requireAdmin()).rejects.toThrow(InternalError);
  });
});
