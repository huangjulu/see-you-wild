import { NextResponse } from "next/server";
import { EVENTS, SITE_URL } from "@/lib/constants";
import type { EventsApiResponse } from "@/lib/types";

export async function GET() {
  const response: EventsApiResponse = {
    data: EVENTS,
    meta: {
      total: EVENTS.length,
      source: SITE_URL,
    },
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
