import { getEnv } from "@/lib/env";
import { LINE_COPY } from "@/lib/line/copy";
import type { FlexBubble, FlexImage } from "@/lib/line/flex";
import type { LineReplyMessage } from "@/lib/line/types";
import {
  MENU_EVENT_LIMIT,
  type MenuEvent,
} from "@/lib/supabase/queries/open-events";

export function buildEventMenuMessages(
  events: MenuEvent[]
): LineReplyMessage[] {
  if (events.length === 0) {
    return [{ type: "text", text: LINE_COPY.noOpenEvents }];
  }
  const baseUrl = getEnv().canonicalUrl;
  return [
    {
      type: "flex",
      altText: LINE_COPY.menuAltText,
      contents: {
        type: "carousel",
        contents: events
          .slice(0, MENU_EVENT_LIMIT)
          .map((event) => buildBubble(event, baseUrl)),
      },
    },
  ];
}

function buildBubble(event: MenuEvent, baseUrl: string): FlexBubble {
  const eventUrl = `${baseUrl}/events/${event.id}`;
  const hero = buildHero(event, baseUrl, eventUrl);
  return {
    type: "bubble",
    size: "kilo",
    ...(hero ? { hero } : {}),
    body: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        {
          type: "text",
          text: event.title,
          size: "lg",
          weight: "bold",
          wrap: true,
          maxLines: 2,
        },
        { type: "text", text: event.location, size: "sm", color: "#8C8C8C" },
        {
          type: "text",
          text: formatDateRange(event.start_date, event.end_date),
          size: "sm",
        },
        {
          type: "text",
          text: formatPrice(event.base_price),
          size: "md",
          weight: "bold",
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          style: "primary",
          height: "sm",
          action: { type: "uri", label: LINE_COPY.viewEvent, uri: eventUrl },
        },
      ],
    },
  };
}

// LINE 要求 hero 是 https 絕對路徑；相對路徑補站台網址，沒圖就不放 hero
function buildHero(
  event: MenuEvent,
  baseUrl: string,
  eventUrl: string
): FlexImage | null {
  const first = event.images[0];
  if (!first) return null;
  const url = first.src.startsWith("/") ? `${baseUrl}${first.src}` : first.src;
  return {
    type: "image",
    url,
    size: "full",
    aspectRatio: "20:13",
    aspectMode: "cover",
    action: { type: "uri", label: LINE_COPY.viewEvent, uri: eventUrl },
  };
}

function formatDateRange(start: string, end: string): string {
  return start === end ? start : `${start} – ${end}`;
}

function formatPrice(price: number): string {
  return `NT$ ${price.toLocaleString("zh-TW")}`;
}
