import { NextResponse } from "next/server";

/**
 * Wrap a successful service result for HTTP transport.
 * Default status is 200; pass a custom status for 201 etc.
 */
export function apiOk<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/**
 * Wrap a service failure for HTTP transport.
 * `details` is reserved for structured error metadata such as Zod field errors.
 */
export function apiError(
  message: string,
  status = 500,
  details?: unknown
): NextResponse {
  const body =
    details === undefined ? { error: message } : { error: message, details };
  return NextResponse.json(body, { status });
}
