import { describe, expect, it } from "vitest";

import { escapeHtml } from "@/lib/email/escape";

describe("escapeHtml", () => {
  it("& 轉為 &amp;", () => {
    expect(escapeHtml("A & B")).toBe("A &amp; B");
  });

  it("< 轉為 &lt;", () => {
    expect(escapeHtml("<div>")).toBe("&lt;div&gt;");
  });

  it("> 轉為 &gt;", () => {
    expect(escapeHtml("a > b")).toBe("a &gt; b");
  });

  it("雙引號轉為 &quot;", () => {
    expect(escapeHtml('say "hello"')).toBe("say &quot;hello&quot;");
  });

  it("單引號轉為 &#x27;", () => {
    expect(escapeHtml("it's")).toBe("it&#x27;s");
  });

  it("script tag 完全 escape", () => {
    const input = '<script>alert("xss")</script>';
    const result = escapeHtml(input);
    expect(result).not.toContain("<script>");
    expect(result).toBe("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
  });

  it("中文字元不受影響", () => {
    expect(escapeHtml("宜蘭野溪溫泉")).toBe("宜蘭野溪溫泉");
  });

  it("空字串回傳空字串", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("混合場景", () => {
    expect(escapeHtml("Tom & Jerry's <fun>")).toBe(
      "Tom &amp; Jerry&#x27;s &lt;fun&gt;"
    );
  });
});
