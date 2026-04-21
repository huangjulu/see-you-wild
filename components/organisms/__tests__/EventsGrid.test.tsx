import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import EventsGrid from "../EventsGrid";
import type { MockEvent } from "@/server/mockdata/mock-events";

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="zh-TW" messages={{}}>
      {ui}
    </NextIntlClientProvider>
  );
}

const mockEvents: MockEvent[] = [
  {
    id: "camping-1",
    type: "camping",
    location: "阿里山",
    title: "野營私廚｜阿里山",
    start_date: "2026-05-18",
    end_date: "2026-05-19",
    base_price: 4800,
    status: "open",
    image: "/img1.jpg",
    imageAlt: "camping",
  },
  {
    id: "sup-1",
    type: "sup",
    location: "花蓮",
    title: "SUP 日出團｜花蓮",
    start_date: "2026-06-15",
    end_date: "2026-06-15",
    base_price: 2800,
    status: "open",
    image: "/img2.jpg",
    imageAlt: "sup",
  },
  {
    id: "hot-spring-1",
    type: "hot-spring",
    location: "栗松",
    title: "野溪溫泉｜栗松",
    start_date: "2026-06-01",
    end_date: "2026-06-02",
    base_price: 3600,
    status: "open",
    image: "/img3.jpg",
    imageAlt: "hot-spring",
  },
];

describe("EventsGrid", () => {
  it("顯示所有活動卡片", () => {
    renderWithIntl(<EventsGrid events={mockEvents} />);
    expect(screen.getByText("野營私廚｜阿里山")).toBeInTheDocument();
    expect(screen.getByText("SUP 日出團｜花蓮")).toBeInTheDocument();
    expect(screen.getByText("野溪溫泉｜栗松")).toBeInTheDocument();
  });

  it("搜尋文字過濾活動", () => {
    renderWithIntl(<EventsGrid events={mockEvents} />);
    const input = screen.getByPlaceholderText(/搜尋/);
    fireEvent.change(input, { target: { value: "SUP" } });
    expect(screen.getByText("SUP 日出團｜花蓮")).toBeInTheDocument();
    expect(screen.queryByText("野營私廚｜阿里山")).not.toBeInTheDocument();
  });

  it("type filter 過濾活動", () => {
    renderWithIntl(<EventsGrid events={mockEvents} />);
    const typeSelect = screen.getByLabelText(/活動類型/);
    fireEvent.change(typeSelect, { target: { value: "camping" } });
    expect(screen.getByText("野營私廚｜阿里山")).toBeInTheDocument();
    expect(screen.queryByText("SUP 日出團｜花蓮")).not.toBeInTheDocument();
  });

  it("location filter 過濾活動", () => {
    renderWithIntl(<EventsGrid events={mockEvents} />);
    const locationSelect = screen.getByLabelText(/地點/);
    fireEvent.change(locationSelect, { target: { value: "花蓮" } });
    expect(screen.getByText("SUP 日出團｜花蓮")).toBeInTheDocument();
    expect(screen.queryByText("野營私廚｜阿里山")).not.toBeInTheDocument();
  });

  it("無結果時顯示提示訊息", () => {
    renderWithIntl(<EventsGrid events={mockEvents} />);
    const input = screen.getByPlaceholderText(/搜尋/);
    fireEvent.change(input, { target: { value: "找不到的活動" } });
    expect(screen.getByText(/沒有找到/)).toBeInTheDocument();
  });

  it("接受 initialType 設定預設篩選", () => {
    renderWithIntl(<EventsGrid events={mockEvents} initialType="sup" />);
    expect(screen.getByText("SUP 日出團｜花蓮")).toBeInTheDocument();
    expect(screen.queryByText("野營私廚｜阿里山")).not.toBeInTheDocument();
  });
});
