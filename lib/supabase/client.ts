import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";

// TODO(SYW-049): type as SupabaseClient<Database> so .from(...) returns row types directly
// and the 8 `as EventRow` / `as RegistrationRow` casts in services/routes can be dropped.
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      getEnv().SUPABASE_URL,
      getEnv().SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _supabase;
}
