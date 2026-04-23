import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import Header from "../Header";

const messages = {
  common: {
    siteName: "See You Wild 西揪團",
    nav: {
      events: "活動行程",
      exploreCta: "開始探索",
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
  },
};

function renderHeader() {
  return render(
    <NextIntlClientProvider locale="zh-TW" messages={messages}>
      <Header />
    </NextIntlClientProvider>
  );
}

describe("Header", () => {
  it("renders nav links", () => {
    renderHeader();
    // desktop nav + mobile nav 各一組，共 2 個
    expect(screen.getAllByText("活動行程")).toHaveLength(2);
    expect(screen.getAllByText("聯絡我們")).toHaveLength(2);
  });

  it("renders hamburger button", () => {
    renderHeader();
    const hamburger = screen.getByLabelText("Open menu");
    expect(hamburger).toBeInTheDocument();
  });

  it("hamburger button has correct aria-expanded=false initially", () => {
    renderHeader();
    const hamburger = screen.getByLabelText("Open menu");
    expect(hamburger).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles mobile menu on hamburger click", () => {
    renderHeader();
    const hamburger = screen.getByLabelText("Open menu");
    fireEvent.click(hamburger);
    expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
    expect(screen.getByLabelText("Close menu")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("has main navigation aria-label", () => {
    renderHeader();
    expect(screen.getByLabelText("Main navigation")).toBeInTheDocument();
  });
});
