import type { SupabaseClient } from "@supabase/supabase-js";
import { vi } from "vitest";

import { getSupabase } from "@/lib/supabase/client";

export function makeSingleChain(result: { data: unknown; error: unknown }) {
  return {
    select: () => ({
      eq: () => ({
        single: vi.fn().mockResolvedValue(result),
      }),
    }),
  };
}

export function makeUpdateChain(result: { error: unknown }) {
  return {
    update: () => ({
      eq: vi.fn().mockResolvedValue(result),
    }),
  };
}

export function makeOptimisticUpdateChain(result: {
  data: unknown;
  error: unknown;
}) {
  return {
    update: () => ({
      eq: () => ({
        eq: () => ({
          select: () => ({
            single: vi.fn().mockResolvedValue(result),
          }),
        }),
      }),
    }),
  };
}

export function makeInsertSingleChain(result: {
  data: unknown;
  error: unknown;
}) {
  return {
    insert: () => ({
      select: () => ({
        single: vi.fn().mockResolvedValue(result),
      }),
    }),
  };
}

// SupabaseClient is opaque 3rd-party type; building a full mock is impractical.
// Tests only exercise .from() (and optionally .rpc()), so we narrow via unknown
// to the partial shape we control.
export function setupSupabaseMock(
  chains: unknown[],
  extras?: { rpcResult?: { error: unknown } }
) {
  const fromMock = vi.fn();
  for (const chain of chains) {
    fromMock.mockReturnValueOnce(chain);
  }
  vi.mocked(getSupabase).mockReturnValue({
    from: fromMock,
    ...(extras?.rpcResult != null
      ? { rpc: vi.fn().mockResolvedValue(extras.rpcResult) }
      : {}),
  } as unknown as SupabaseClient);
}
