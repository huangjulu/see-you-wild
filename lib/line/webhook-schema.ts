import { z } from "zod";

const requiredId = z.string().min(1);

// LINE Platform 會持續加欄位，一律 loose 不因未知欄位拒收。
const lineSourceSchema = z.looseObject({
  type: requiredId,
  // 群組 / 聊天室事件沒有 userId；缺就在 route 層 ignored，不在 schema 層拒收
  userId: requiredId.optional(),
});

const lineEventBaseShape = {
  timestamp: z.number(),
  webhookEventId: requiredId.optional(),
  source: lineSourceSchema,
  deliveryContext: z.looseObject({ isRedelivery: z.boolean() }),
};

const lineTextMessageEventSchema = z.looseObject({
  ...lineEventBaseShape,
  type: z.literal("message"),
  replyToken: requiredId,
  message: z.looseObject({
    id: requiredId,
    type: z.literal("text"),
    text: z.string(),
  }),
});

const lineFollowEventSchema = z.looseObject({
  ...lineEventBaseShape,
  type: z.literal("follow"),
  // 選填：收不到 token 只是回不了歡迎訊息，不該讓整個 follow 事件被判為無效
  replyToken: requiredId.optional(),
});

const lineUnfollowEventSchema = z.looseObject({
  ...lineEventBaseShape,
  type: z.literal("unfollow"),
});

export const lineEventSchema = z.discriminatedUnion("type", [
  lineTextMessageEventSchema,
  lineFollowEventSchema,
  lineUnfollowEventSchema,
]);

export type LineEvent = z.infer<typeof lineEventSchema>;

export const lineWebhookEnvelopeSchema = z.looseObject({
  destination: requiredId.optional(),
  events: z.array(z.unknown()),
});
