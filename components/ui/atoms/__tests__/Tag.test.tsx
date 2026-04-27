import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Tag from "../Tag";

describe("Tag", () => {
  it("renders children text", () => {
    render(<Tag>Limited</Tag>);
    expect(screen.getByText("Limited")).toBeInTheDocument();
  });

  it("applies base styles", () => {
    render(<Tag>Badge</Tag>);
    const el = screen.getByText("Badge");
    expect(el.className).toContain("inline-block");
    expect(el.className).toContain("rounded-full");
    expect(el.className).toContain("typo-overline");
  });

  it("merges custom className", () => {
    render(<Tag className="mt-4">Custom</Tag>);
    expect(screen.getByText("Custom").className).toContain("mt-4");
  });
});
