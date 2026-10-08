import { LINE_COPY, LINE_MENU_KEYWORDS } from "@/lib/line/copy";
import { buildEventMenuMessages } from "@/lib/line/event-menu";
import { replyLineMessages } from "@/lib/line/reply";
import type {
  LineDeliveryResult,
  LineEventOutcome,
  LineReplyMessage,
} from "@/lib/line/types";
import type { LineEvent } from "@/lib/line/webhook-schema";
import { getOpenEventsForMenu } from "@/lib/supabase/queries/open-events";

export async function handleLineEvent(
  event: LineEvent
): Promise<LineEventOutcome> {
  switch (event.type) {
    case "follow": {
      const menu = await buildMenu();
      const delivery = await replyLineMessages(event.replyToken, [
        { type: "text", text: LINE_COPY.welcome },
        ...menu,
      ]);
      return toOutcome("welcome", delivery);
    }
    case "message": {
      if (!isMenuKeyword(event.message.text)) {
        return {
          outcome: "ignored",
          code: "no_keyword",
          delivery: "not_attempted",
        };
      }
      const delivery = await replyLineMessages(
        event.replyToken,
        await buildMenu()
      );
      return toOutcome("menu", delivery);
    }
    case "unfollow":
      return {
        outcome: "ignored",
        code: "unfollow",
        delivery: "not_attempted",
      };
  }
}

async function buildMenu(): Promise<LineReplyMessage[]> {
  return buildEventMenuMessages(await getOpenEventsForMenu());
}

function isMenuKeyword(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return LINE_MENU_KEYWORDS.some(
    (keyword) => keyword.toLowerCase() === normalized
  );
}

function toOutcome(
  code: "welcome" | "menu",
  delivery: LineDeliveryResult
): LineEventOutcome {
  return {
    outcome: delivery === "failed" ? "failed" : "replied",
    code,
    delivery,
  };
}
