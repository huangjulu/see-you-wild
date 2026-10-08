import { createHmac } from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/line/webhook-service", () => ({ handleLineEvent: vi.fn() }));

import { handleLineEvent } from "@/lib/line/webhook-service";

import { POST } from "../route";

const secret = "test-secret";
const ruru = "U" + "a".repeat(32);
const other = "U" + "b".repeat(32);

function sign(body: string): string {
  return createHmac("sha256", secret).update(body).digest("base64");
}

function makeRequest(
  body: string,
  signature: string | null = sign(body)
): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (signature != null) headers.set("x-line-signature", signature);
  return new Request("https://seeyouwild.com/api/line/webhook", {
    method: "POST",
    headers,
    body,
  });
}

function followEvent(userId: string | undefined) {
  return {
    type: "follow",
    timestamp: 1,
    replyToken: "tok",
    source: userId ? { type: "user", userId } : { type: "group" },
    deliveryContext: { isRedelivery: false },
  };
}

describe("POST /api/line/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("LINE_CHANNEL_SECRET", secret);
    vi.stubEnv("LINE_AUDIENCE", "admin");
    vi.stubEnv("LINE_ADMIN_USER_IDS", ruru);
    vi.mocked(handleLineEvent).mockResolvedValue({
      outcome: "replied",
      code: "welcome",
      delivery: "sent",
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("無簽章回 403", async () => {
    const response = await POST(makeRequest('{"events":[]}', null));
    expect(response.status).toBe(403);
  });

  it("簽章不符回 403", async () => {
    const response = await POST(makeRequest('{"events":[]}', "bad"));
    expect(response.status).toBe(403);
  });

  it("缺 LINE_CHANNEL_SECRET 回 403", async () => {
    vi.stubEnv("LINE_CHANNEL_SECRET", "");
    const response = await POST(makeRequest('{"events":[]}'));
    expect(response.status).toBe(403);
  });

  it("壞 JSON 回 400", async () => {
    const response = await POST(makeRequest("{not json"));
    expect(response.status).toBe(400);
  });

  it("空 events 回 200（console Verify）", async () => {
    const response = await POST(makeRequest('{"events":[]}'));
    expect(response.status).toBe(200);
    expect(handleLineEvent).not.toHaveBeenCalled();
  });

  it("名單內事件進 handler", async () => {
    const body = JSON.stringify({ events: [followEvent(ruru)] });
    const response = await POST(makeRequest(body));
    expect(response.status).toBe(200);
    expect(handleLineEvent).toHaveBeenCalledTimes(1);
  });

  it("名單外事件不進 handler", async () => {
    const body = JSON.stringify({ events: [followEvent(other)] });
    await POST(makeRequest(body));
    expect(handleLineEvent).not.toHaveBeenCalled();
  });

  it("缺 userId 不進 handler", async () => {
    const body = JSON.stringify({ events: [followEvent(undefined)] });
    await POST(makeRequest(body));
    expect(handleLineEvent).not.toHaveBeenCalled();
  });

  it("單一事件 throw 不中斷其他事件", async () => {
    vi.mocked(handleLineEvent)
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce({
        outcome: "replied",
        code: "welcome",
        delivery: "sent",
      });
    const body = JSON.stringify({
      events: [followEvent(ruru), followEvent(ruru)],
    });
    const response = await POST(makeRequest(body));
    expect(response.status).toBe(200);
    expect(handleLineEvent).toHaveBeenCalledTimes(2);
  });
});
