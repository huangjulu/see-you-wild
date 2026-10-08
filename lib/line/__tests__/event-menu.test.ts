import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  getEnv: () => ({ canonicalUrl: "https://seeyouwild.com" }),
}));

import { LINE_COPY } from "@/lib/line/copy";
import { buildEventMenuMessages } from "@/lib/line/event-menu";
import type { MenuEvent } from "@/lib/supabase/queries/open-events";

function makeMenuEvent(overrides: Partial<MenuEvent> = {}): MenuEvent {
  return {
    id: "sup-0712",
    title: "SUP 立槳體驗",
    location: "宜蘭",
    start_date: "2026-07-12",
    end_date: "2026-07-12",
    base_price: 2800,
    images: [{ src: "https://cdn.example.com/sup.jpg", alt: "sup" }],
    ...overrides,
  };
}

function getCarousel(messages: ReturnType<typeof buildEventMenuMessages>) {
  const flex = messages[0];
  if (flex.type !== "flex" || flex.contents.type !== "carousel") {
    throw new Error("expected carousel");
  }
  return flex.contents;
}

function bodyTexts(bubble: ReturnType<typeof getCarousel>["contents"][number]) {
  return bubble.body.contents.flatMap((c) =>
    c.type === "text" ? [c.text] : []
  );
}

describe("buildEventMenuMessages", () => {
  it("空陣列回單一文字訊息", () => {
    expect(buildEventMenuMessages([])).toEqual([
      { type: "text", text: LINE_COPY.noOpenEvents },
    ]);
  });

  it("11 筆截到 10 張 bubble", () => {
    const events = Array.from({ length: 11 }, (_, i) =>
      makeMenuEvent({ id: `e${i}` })
    );
    expect(getCarousel(buildEventMenuMessages(events)).contents).toHaveLength(
      10
    );
  });

  it("相對圖路徑補 canonicalUrl", () => {
    const bubble = getCarousel(
      buildEventMenuMessages([
        makeMenuEvent({ images: [{ src: "/images/a.webp", alt: "" }] }),
      ])
    ).contents[0];
    expect(bubble.hero?.url).toBe("https://seeyouwild.com/images/a.webp");
  });

  it("無圖不放 hero", () => {
    const bubble = getCarousel(
      buildEventMenuMessages([makeMenuEvent({ images: [] })])
    ).contents[0];
    expect(bubble.hero).toBeUndefined();
  });

  it("按鈕連到活動頁", () => {
    const bubble = getCarousel(buildEventMenuMessages([makeMenuEvent()]))
      .contents[0];
    const button = bubble.footer?.contents[0];
    expect(
      button?.type === "button" && button.action.type === "uri"
        ? button.action.uri
        : null
    ).toBe("https://seeyouwild.com/events/sup-0712");
  });

  it("同日只顯示一天，跨日顯示區間，價格千分位", () => {
    const sameDay = getCarousel(buildEventMenuMessages([makeMenuEvent()]))
      .contents[0];
    expect(bodyTexts(sameDay)).toContain("2026-07-12");
    expect(bodyTexts(sameDay)).toContain("NT$ 2,800");

    const multiDay = getCarousel(
      buildEventMenuMessages([makeMenuEvent({ end_date: "2026-07-13" })])
    ).contents[0];
    expect(bodyTexts(multiDay)).toContain("2026-07-12 – 2026-07-13");
  });
});
