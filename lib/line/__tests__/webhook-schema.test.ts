import { describe, expect, it } from "vitest";

import {
  lineEventSchema,
  lineWebhookEnvelopeSchema,
} from "@/lib/line/webhook-schema";

const base = {
  timestamp: 1,
  source: { type: "user", userId: "U" + "a".repeat(32) },
  deliveryContext: { isRedelivery: false },
};

describe("lineWebhookEnvelopeSchema", () => {
  it("空 events 通過（LINE console Verify）", () => {
    expect(lineWebhookEnvelopeSchema.safeParse({ events: [] }).success).toBe(
      true
    );
  });
});

describe("lineEventSchema", () => {
  it("follow 無 replyToken 仍通過", () => {
    expect(lineEventSchema.safeParse({ ...base, type: "follow" }).success).toBe(
      true
    );
  });

  it("text message 通過", () => {
    const result = lineEventSchema.safeParse({
      ...base,
      type: "message",
      replyToken: "tok",
      message: { id: "m1", type: "text", text: "活動" },
    });
    expect(result.success).toBe(true);
  });

  it("unfollow 通過", () => {
    expect(
      lineEventSchema.safeParse({ ...base, type: "unfollow" }).success
    ).toBe(true);
  });

  it("source 無 userId 仍通過（群組事件）", () => {
    const result = lineEventSchema.safeParse({
      ...base,
      source: { type: "group" },
      type: "follow",
    });
    expect(result.success).toBe(true);
  });

  it("sticker message 被拒", () => {
    const result = lineEventSchema.safeParse({
      ...base,
      type: "message",
      replyToken: "tok",
      message: { id: "m1", type: "sticker" },
    });
    expect(result.success).toBe(false);
  });

  it("postback 被拒", () => {
    const result = lineEventSchema.safeParse({
      ...base,
      type: "postback",
      replyToken: "tok",
      postback: { data: "x" },
    });
    expect(result.success).toBe(false);
  });
});
