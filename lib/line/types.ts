import type { FlexMessage } from "@/lib/line/flex";

export type LineDeliveryResult = "sent" | "failed" | "not_attempted";

export type LineReplyMessage = { type: "text"; text: string } | FlexMessage;

export type LineEventOutcomeCode =
  | "welcome"
  | "menu"
  | "no_keyword"
  | "unfollow"
  | "unauthorized"
  | "missing_user_id";

export interface LineEventOutcome {
  outcome: "replied" | "ignored" | "failed";
  code: LineEventOutcomeCode;
  delivery: LineDeliveryResult;
}
