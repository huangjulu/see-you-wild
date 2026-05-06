import { createClient, SupabaseClient } from "@supabase/supabase-js";

import { getEnv } from "@/lib/env";

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
