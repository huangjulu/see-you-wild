import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../Header";

describe("Header", () => {
  it("renders nav links", () => {
    render(<Header />);
    expect(screen.getByText("活動行程")).toBeInTheDocument();
    expect(screen.getByText("包團諮詢")).toBeInTheDocument();
    expect(screen.getByText("聯絡我們")).toBeInTheDocument();
  });

  it("renders hamburger button", () => {
    render(<Header />);
    const hamburger = screen.getByLabelText("Open menu");
    expect(hamburger).toBeInTheDocument();
  });

  it("hamburger button has correct aria-expanded=false initially", () => {
    render(<Header />);
    const hamburger = screen.getByLabelText("Open menu");
    expect(hamburger).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles mobile menu on hamburger click", () => {
    render(<Header />);
    const hamburger = screen.getByLabelText("Open menu");
    fireEvent.click(hamburger);
    // After click, label changes to "Close menu"
    expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
    expect(screen.getByLabelText("Close menu")).toHaveAttribute("aria-expanded", "true");
  });

  it("has main navigation aria-label", () => {
    render(<Header />);
    expect(screen.getByLabelText("Main navigation")).toBeInTheDocument();
  });
});
