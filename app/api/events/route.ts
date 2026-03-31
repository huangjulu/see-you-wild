import { NextResponse } from "next/server";
import { EVENTS_CONFIG, SITE_URL } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n";
import type { EventsApiResponse } from "@/lib/types";

export async function GET() {
  const { home } = await getDictionary("zh-TW");

  const data = EVENTS_CONFIG.map((config) => {
    const text = home.events.items[config.id as keyof typeof home.events.items];
    return {
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
    };
  });

  const response: EventsApiResponse = {
    data,
    meta: {
      total: data.length,
      source: SITE_URL,
    },
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
