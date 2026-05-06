import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Button from "../Button";

describe("Button", () => {
  it("渲染 children 文字", () => {
    render(<Button theme="solid">Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("套用 solid theme class", () => {
    render(<Button theme="solid">Solid</Button>);
    const el = screen.getByRole("button");
    expect(el.className).toContain("bg-fill-brand");
  });

  it("套用 ghost theme class", () => {
    render(<Button theme="ghost">Ghost</Button>);
    const el = screen.getByRole("button");
    expect(el.className).toContain("border");
  });

  it("link theme 渲染為 <a>", () => {
    render(
      <Button theme="link" href="https://example.com">
        Link
      </Button>
    );
    const el = screen.getByRole("link");
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "https://example.com");
  });

  it("傳入 icon 時渲染 icon", () => {
    render(
      <Button theme="text" icon={<span data-testid="icon">X</span>}>
        Close
      </Button>
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("轉發 aria-label", () => {
    render(
      <Button theme="solid" ariaLabel="My label">
        OK
      </Button>
    );
    expect(screen.getByLabelText("My label")).toBeInTheDocument();
  });
});
