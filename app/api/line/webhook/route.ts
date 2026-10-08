import { NextResponse } from "next/server";

import { isLineAudience } from "@/lib/line/audience";
import { readLineEnv } from "@/lib/line/env";
import { verifyLineSignature } from "@/lib/line/signature";
import type { LineEventOutcome } from "@/lib/line/types";
import {
  lineEventSchema,
  lineWebhookEnvelopeSchema,
} from "@/lib/line/webhook-schema";
import { handleLineEvent } from "@/lib/line/webhook-service";

// LINE Platform webhook 唯一入口：驗簽 → 解析 → 名單閘門 → 逐事件處理。
// 不走 handleError：LINE 端只看 status code，錯誤格式對齊 LINE 慣例而非站內 API。
export async function POST(request: Request) {
  const { channelSecret } = readLineEnv();
  const signature = request.headers.get("x-line-signature");
  const rawBody = await request.text();
  // 缺 secret 視同驗簽失敗——略過等於放行偽造來源
  if (
    !channelSecret ||
    !signature ||
    !verifyLineSignature(rawBody, signature, channelSecret)
  ) {
    return NextResponse.json({ error: "invalid signature" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const envelope = lineWebhookEnvelopeSchema.safeParse(body);
  if (!envelope.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  // serverless 回應後即凍結，每個事件必須 await 完才回 200。
  // LINE console Verify 送空 events，直接落到回 200。
  for (const [eventIndex, candidate] of envelope.data.events.entries()) {
    const event = lineEventSchema.safeParse(candidate);
    if (!event.success) {
      console.warn("[LINE webhook] event outcome", {
        eventIndex,
        outcome: "invalid",
      });
      continue;
    }
    const userId = event.data.source.userId;
    if (!userId) {
      logOutcome(eventIndex, event.data.type, ignored("missing_user_id"));
      continue;
    }
    if (!isLineAudience(userId)) {
      logOutcome(eventIndex, event.data.type, ignored("unauthorized"));
      continue;
    }
    try {
      logOutcome(
        eventIndex,
        event.data.type,
        await handleLineEvent(event.data)
      );
    } catch (error) {
      console.error("[LINE webhook] event outcome", {
        eventIndex,
        eventType: event.data.type,
        outcome: "failed",
        code: "unexpected_handler_error",
        error,
      });
    }
  }
  return NextResponse.json({ ok: true });
}

function ignored(code: "missing_user_id" | "unauthorized"): LineEventOutcome {
  return { outcome: "ignored", code, delivery: "not_attempted" };
}

// 只印 eventType / outcome / code，不印 userId 與訊息內容
function logOutcome(
  eventIndex: number,
  eventType: string,
  result: LineEventOutcome
) {
  const entry = {
    eventIndex,
    eventType,
    outcome: result.outcome,
    code: result.code,
    delivery: result.delivery,
  };
  if (result.outcome === "failed") {
    console.error("[LINE webhook] event outcome", entry);
    return;
  }
  console.info("[LINE webhook] event outcome", entry);
}
