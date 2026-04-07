import { Resend } from "resend";
import { getEnv } from "@/lib/env";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(getEnv().RESEND_API_KEY);
  }
  return _resend;
}
