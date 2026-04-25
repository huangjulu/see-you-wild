import { NextResponse } from "next/server";

/**
 * Wrap a successful response for HTTP transport.
 * Default status is 200; pass a custom status for 201 etc.
 * Failure paths flow through handleError — see lib/api/handle-error.ts.
 */
export function apiOk<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}
