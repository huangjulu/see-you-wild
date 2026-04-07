import { createHmac } from "crypto";

function getSecret(): string {
  return process.env.TOKEN_SECRET!;
}

export function generateToken(registrationId: string): string {
  return createHmac("sha256", getSecret()).update(registrationId).digest("hex");
}

export function verifyToken(registrationId: string, token: string): boolean {
  const expected = generateToken(registrationId);
  return expected === token;
}
