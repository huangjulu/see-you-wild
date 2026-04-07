import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().trim().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1),
  RESEND_API_KEY: z.string().trim().min(1),
  RESEND_FROM: z.string().trim().min(1),
});

export const env = envSchema.parse(process.env);
