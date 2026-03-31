import { NextResponse } from "next/server";
import { EVENTS_CONFIG, SITE_URL } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n";
import type { EventApiResponse, ApiError } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const config = EVENTS_CONFIG.find((e) => e.id === id);

  if (!config) {
    const error: ApiError = { error: "Event not found", status: 404 };
    return NextResponse.json(error, { status: 404 });
  }

  const { home } = await getDictionary("zh-TW");
  const text = home.events.items[config.id as keyof typeof home.events.items];

  const response: EventApiResponse = {
    data: {
      id: config.id,
      tag: text.tag,
      title: text.title,
      subtitle: text.subtitle,
      date: text.date,
      description: text.description,
      cta: text.cta,
      ctaUrl: config.ctaUrl,
      image: config.image,
      imageAlt: text.imageAlt,
      variant: config.variant,
    },
    meta: { source: SITE_URL },
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
