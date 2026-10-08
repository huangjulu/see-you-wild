import { readLineEnv } from "@/lib/line/env";
import type { LineDeliveryResult, LineReplyMessage } from "@/lib/line/types";

// reply（回應收到的事件，免費、不佔配額）全 repo 只准從這裡出去。
// 回覆是 best-effort：replyToken 單次有效約一分鐘，失敗不重試也不擋 webhook 主流程。
export async function replyLineMessages(
  replyToken: string | undefined,
  messages: LineReplyMessage[]
): Promise<LineDeliveryResult> {
  const token = readLineEnv().channelAccessToken;
  if (!token || !replyToken) return "not_attempted";
  try {
    const response = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ replyToken, messages }),
    });
    if (response.ok) return "sent";
    console.error("[LINE reply] delivery failed", {
      delivery: "failed",
      httpStatus: response.status,
    });
    return "failed";
  } catch {
    console.error("[LINE reply] delivery failed", { delivery: "failed" });
    return "failed";
  }
}
