// components/ui/atoms/__tests__/Section.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Section from "../Section";

describe("Section", () => {
  it("預設渲染 <section> 元素", () => {
    render(<Section data-testid="s">content</Section>);
    const el = screen.getByTestId("s");
    expect(el.tagName).toBe("SECTION");
  });

  it("as prop 切換渲染元素", () => {
    render(
      <Section as="div" data-testid="s">
        content
      </Section>
    );
    const el = screen.getByTestId("s");
    expect(el.tagName).toBe("DIV");
  });

  it("包含 grid 和 container class", () => {
    render(<Section data-testid="s">content</Section>);
    const el = screen.getByTestId("s");
    expect(el.className).toContain("grid");
    expect(el.className).toContain("grid-cols-4");
    expect(el.className).toContain("max-w-7xl");
    expect(el.className).toContain("mx-auto");
    expect(el.className).toContain("px-10");
    expect(el.className).toContain("gap-3");
  });

  it("外部 className 被合併", () => {
    render(
      <Section className="py-16 bg-background" data-testid="s">
        content
      </Section>
    );
    const el = screen.getByTestId("s");
    expect(el.className).toContain("py-16");
    expect(el.className).toContain("bg-background");
  });

  it("children 被渲染", () => {
    render(<Section>hello grid</Section>);
    expect(screen.getByText("hello grid")).toBeDefined();
  });
});
