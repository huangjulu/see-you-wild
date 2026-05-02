import { adminToken } from "@/lib/token";
import { UnauthorizedError } from "@/lib/errors/domain";

interface AuthenticateAdminActionInput {
  registrationId: string;
  body: { token?: string };
}

export function authenticateAdminAction(
  input: AuthenticateAdminActionInput
): void {
  // Strategy 2: HMAC admin token
  if (input.body.token && adminToken().verify(input.registrationId, input.body.token)) {
    return;
  }

  throw new UnauthorizedError("Invalid or missing admin token");
}
