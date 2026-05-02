import { describe, expect, it } from "vitest";

import { escapeHtml } from "@/lib/email/escape";

describe("escapeHtml", () => {
  it("將 & 轉義為 &amp;", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("將 < 轉義為 &lt;", () => {
    expect(escapeHtml("a < b")).toBe("a &lt; b");
  });

  it("將 > 轉義為 &gt;", () => {
    expect(escapeHtml("div>")).toBe("div&gt;");
  });

  it('將 " 轉義為 &quot;', () => {
    expect(escapeHtml('say "hello"')).toBe("say &quot;hello&quot;");
  });

  it("將 ' 轉義為 &#x27;", () => {
    expect(escapeHtml("it's")).toBe("it&#x27;s");
  });

  it("同時處理多個特殊字元", () => {
    expect(escapeHtml('<a href="url">O\'Brien & Co</a>')).toBe(
      "&lt;a href=&quot;url&quot;&gt;O&#x27;Brien &amp; Co&lt;/a&gt;"
    );
  });

  it("空字串原樣回傳", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("不含特殊字元的字串原樣回傳", () => {
    expect(escapeHtml("Hello World 123")).toBe("Hello World 123");
  });
});
