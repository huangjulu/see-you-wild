import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getEnv } from "@/lib/env";
import { InternalError, UnauthorizedError } from "@/lib/errors/domain";

/**
 * Guard for admin-only write routes. Verifies a logged-in Supabase session
 * from the request cookies and throws on failure so `handleError` maps it to 401.
 *
 * WARNING: admin route handlers use the service-role client (bypasses RLS), and
 * the middleware matcher excludes `/api`. Without this guard those endpoints are
 * unauthenticated. Call it first inside every admin write handler.
 */
export async function requireAdmin(): Promise<void> {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) {
    throw new InternalError("NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured");
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    getEnv().NEXT_PUBLIC_SUPABASE_URL,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Route handlers verify the session read-only; no cookie writes needed.
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError("Admin authentication required");
  }
}
