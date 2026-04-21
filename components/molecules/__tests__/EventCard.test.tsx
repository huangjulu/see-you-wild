import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import EventCard from "../EventCard";

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="zh-TW" messages={{}}>
      {ui}
    </NextIntlClientProvider>
  );
}

const baseProps = {
  id: "camping-chef-alishan-202605",
  type: "camping",
  location: "阿里山",
  title: "野營私廚｜阿里山秘境",
  startDate: "2026-05-18",
  endDate: "2026-05-19",
  basePrice: 4800,
  status: "open" as const,
  image:
    "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=600&q=80",
  imageAlt: "阿里山野營",
};

describe("EventCard", () => {
  it("顯示活動標題", () => {
    renderWithIntl(<EventCard {...baseProps} />);
    expect(screen.getByText("野營私廚｜阿里山秘境")).toBeInTheDocument();
  });

  it("顯示活動類型 tag", () => {
    renderWithIntl(<EventCard {...baseProps} />);
    expect(screen.getByText("camping")).toBeInTheDocument();
  });

  it("顯示地點", () => {
    renderWithIntl(<EventCard {...baseProps} />);
    expect(screen.getByText(/阿里山 · 2026-05-18/)).toBeInTheDocument();
  });

  it("顯示價格", () => {
    renderWithIntl(<EventCard {...baseProps} />);
    expect(screen.getByText(/4,800/)).toBeInTheDocument();
  });

  it("顯示活動圖片與 alt text", () => {
    renderWithIntl(<EventCard {...baseProps} />);
    const img = screen.getByAltText("阿里山野營");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", baseProps.image);
  });

  it("整張卡片是 article 元素", () => {
    const { container } = renderWithIntl(<EventCard {...baseProps} />);
    expect(container.querySelector("article")).toBeInTheDocument();
  });

  it("顯示日期", () => {
    renderWithIntl(<EventCard {...baseProps} />);
    expect(screen.getByText(/2026-05-18/)).toBeInTheDocument();
  });
});
