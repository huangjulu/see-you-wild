import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().trim().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1),
  RESEND_API_KEY: z.string().trim().min(1),
  RESEND_FROM: z.string().trim().min(1),
});

type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    _env = envSchema.parse(process.env);
  }
  return _env;
}
