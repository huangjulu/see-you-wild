import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../Header";

const mockDict = {
  siteName: "See You Wild 西揪團",
  nav: {
    events: "活動行程",
    privateGroup: "包團諮詢",
    contact: "聯絡我們",
  },
  footer: {
    rights: "All rights reserved.",
  },
  error: {
    heading: "Oops",
    message: "發生了一點問題",
    retry: "重新嘗試",
  },
  notFound: {
    heading: "404",
    message: "找不到這個頁面",
    backHome: "回到首頁",
  },
};

describe("Header", () => {
  it("renders nav links", () => {
    render(<Header dict={mockDict} locale="zh-TW" />);
    expect(screen.getByText("活動行程")).toBeInTheDocument();
    expect(screen.getByText("包團諮詢")).toBeInTheDocument();
    expect(screen.getByText("聯絡我們")).toBeInTheDocument();
  });

  it("renders hamburger button", () => {
    render(<Header dict={mockDict} locale="zh-TW" />);
    const hamburger = screen.getByLabelText("Open menu");
    expect(hamburger).toBeInTheDocument();
  });

  it("hamburger button has correct aria-expanded=false initially", () => {
    render(<Header dict={mockDict} locale="zh-TW" />);
    const hamburger = screen.getByLabelText("Open menu");
    expect(hamburger).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles mobile menu on hamburger click", () => {
    render(<Header dict={mockDict} locale="zh-TW" />);
    const hamburger = screen.getByLabelText("Open menu");
    fireEvent.click(hamburger);
    // After click, label changes to "Close menu"
    expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
    expect(screen.getByLabelText("Close menu")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("has main navigation aria-label", () => {
    render(<Header dict={mockDict} locale="zh-TW" />);
    expect(screen.getByLabelText("Main navigation")).toBeInTheDocument();
  });
});
