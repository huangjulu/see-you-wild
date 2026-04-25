import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DomainError, InternalError } from "@/lib/errors/domain";

/**
 * Translate any error thrown inside a route handler into an HTTP response.
 *
 * Wrap the *entire* route body (including `request.json()` and Zod parsing)
 * in `try { ... } catch (err) { return handleError(err); }` so that:
 *   - Malformed JSON bodies fall through here, not Next.js's default 500
 *   - Zod throws are mapped to a structured 400
 *   - DomainError subclasses use their declared status
 *   - Anything else logs the original and returns a generic 500
 */
export function handleError(err: unknown): NextResponse {
  if (err instanceof DomainError) {
    if (err instanceof InternalError && err.cause !== undefined) {
      console.error("[api] internal error", err.cause);
    }
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: err.flatten() },
      { status: 400 }
    );
  }

  if (err instanceof SyntaxError) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  console.error("[api] unhandled error", err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
