import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Text from "../Text";

describe("Text", () => {
  it("renders as a paragraph by default", () => {
    render(<Text>Hello</Text>);
    const el = screen.getByText("Hello");
    expect(el.tagName).toBe("P");
  });

  it("renders children", () => {
    render(<Text>Some content</Text>);
    expect(screen.getByText("Some content")).toBeInTheDocument();
  });

  it("applies primary text color by default", () => {
    render(<Text>Primary</Text>);
    expect(screen.getByText("Primary").className).toContain("text-foreground");
  });

  it("applies muted text color when muted=true", () => {
    render(<Text muted>Muted</Text>);
    expect(screen.getByText("Muted").className).toContain("text-muted");
  });

  it("merges custom className", () => {
    render(<Text className="text-lg">Big</Text>);
    expect(screen.getByText("Big").className).toContain("text-lg");
  });
});
