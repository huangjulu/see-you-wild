import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/line/reply", () => ({ replyLineMessages: vi.fn() }));
vi.mock("@/lib/supabase/queries/open-events", () => ({
  getOpenEventsForMenu: vi.fn(),
  MENU_EVENT_LIMIT: 10,
}));
vi.mock("@/lib/env", () => ({
  getEnv: () => ({ canonicalUrl: "https://seeyouwild.com" }),
}));

import { replyLineMessages } from "@/lib/line/reply";
import type { LineEvent } from "@/lib/line/webhook-schema";
import { handleLineEvent } from "@/lib/line/webhook-service";
import { getOpenEventsForMenu } from "@/lib/supabase/queries/open-events";

const base = {
  timestamp: 1,
  source: { type: "user", userId: "U" + "a".repeat(32) },
  deliveryContext: { isRedelivery: false },
};

function textEvent(text: string): LineEvent {
  return {
    ...base,
    type: "message",
    replyToken: "tok",
    message: { id: "m", type: "text", text },
  };
}

describe("handleLineEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(replyLineMessages).mockResolvedValue("sent");
    vi.mocked(getOpenEventsForMenu).mockResolvedValue([]);
  });

  it("follow 回歡迎文字 + 選單共 2 則", async () => {
    const outcome = await handleLineEvent({
      ...base,
      type: "follow",
      replyToken: "tok",
    });
    expect(outcome).toEqual({
      outcome: "replied",
      code: "welcome",
      delivery: "sent",
    });
    const [, messages] = vi.mocked(replyLineMessages).mock.calls[0];
    expect(messages).toHaveLength(2);
    expect(messages[0].type).toBe("text");
  });

  it("關鍵字只回選單 1 則", async () => {
    const outcome = await handleLineEvent(textEvent("活動"));
    expect(outcome.code).toBe("menu");
    expect(vi.mocked(replyLineMessages).mock.calls[0][1]).toHaveLength(1);
  });

  it("關鍵字含空白與大小寫仍命中", async () => {
    await handleLineEvent(textEvent("  MENU "));
    expect(replyLineMessages).toHaveBeenCalledTimes(1);
  });

  it("無關文字 ignored 不回", async () => {
    const outcome = await handleLineEvent(textEvent("你好"));
    expect(outcome).toEqual({
      outcome: "ignored",
      code: "no_keyword",
      delivery: "not_attempted",
    });
    expect(replyLineMessages).not.toHaveBeenCalled();
  });

  it("unfollow ignored 不回", async () => {
    const outcome = await handleLineEvent({ ...base, type: "unfollow" });
    expect(outcome.code).toBe("unfollow");
    expect(replyLineMessages).not.toHaveBeenCalled();
  });

  it("reply 失敗時 outcome 為 failed", async () => {
    vi.mocked(replyLineMessages).mockResolvedValue("failed");
    const outcome = await handleLineEvent(textEvent("活動"));
    expect(outcome).toEqual({
      outcome: "failed",
      code: "menu",
      delivery: "failed",
    });
  });
});
