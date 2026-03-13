import { NextResponse } from "next/server";
import { EVENTS, SITE_URL } from "@/lib/constants";
import type { EventApiResponse, ApiError } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = EVENTS.find((e) => e.id === id);

  if (!event) {
    const error: ApiError = { error: "Event not found", status: 404 };
    return NextResponse.json(error, { status: 404 });
  }

  const response: EventApiResponse = {
    data: event,
    meta: { source: SITE_URL },
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
