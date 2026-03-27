import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Button from "../Button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button variant="solid" href="https://example.com">Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("renders as an anchor with the correct href", () => {
    render(<Button variant="solid" href="https://example.com">Link</Button>);
    const el = screen.getByRole("button");
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "https://example.com");
  });

  it("has target=_blank and rel=noopener noreferrer", () => {
    render(<Button variant="solid" href="https://example.com">Link</Button>);
    const el = screen.getByRole("button");
    expect(el).toHaveAttribute("target", "_blank");
    expect(el).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("applies solid variant classes", () => {
    render(<Button variant="solid" href="#">Solid</Button>);
    const el = screen.getByRole("button");
    expect(el.className).toContain("bg-accent");
  });

  it("applies ghost variant classes", () => {
    render(<Button variant="ghost" href="#">Ghost</Button>);
    const el = screen.getByRole("button");
    expect(el.className).toContain("border");
    expect(el.className).not.toContain("bg-accent");
  });

  it("forwards aria-label", () => {
    render(<Button variant="solid" href="#" ariaLabel="My label">OK</Button>);
    expect(screen.getByLabelText("My label")).toBeInTheDocument();
  });
});
