import { z } from "zod";

import { SITE_URL } from "@/lib/constants";

const envSchema = z.object({
  SUPABASE_URL: z.string().trim().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1),
  RESEND_API_KEY: z.string().trim().min(1),
  RESEND_FROM: z.string().trim().min(1),
  BASE_URL: z.string().trim().url().optional(),
});

type Env = z.infer<typeof envSchema> & { readonly canonicalUrl: string };

let _env: Env | null = null;

function resolveCanonicalUrl(): string {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return SITE_URL;
}

export function getEnv(): Env {
  if (!_env) {
    const parsed = envSchema.parse(process.env);
    _env = { ...parsed, canonicalUrl: resolveCanonicalUrl() };
  }
  return _env;
}
