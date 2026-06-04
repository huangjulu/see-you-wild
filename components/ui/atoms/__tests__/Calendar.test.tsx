import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Calendar from "../Calendar";

/* ─── 1. Default ─── */

describe("Calendar（預設）", () => {
  it("渲染月曆並顯示星期標頭", () => {
    render(<Calendar mode="single" defaultMonth={new Date(2026, 4, 1)} />);
    expect(screen.getByText("一")).toBeInTheDocument();
    expect(screen.getByText("日")).toBeInTheDocument();
    expect(screen.getByText("2026年5月")).toBeInTheDocument();
  });

  it("value 傳入時對應日期有 selected 狀態", () => {
    const { container } = render(
      <Calendar
        mode="single"
        value={new Date(2026, 4, 18)}
        defaultMonth={new Date(2026, 4, 1)}
      />
    );
    const selectedBtn = container.querySelector(
      "[data-selected-single='true']"
    ) as HTMLElement | null;
    expect(selectedBtn).toBeTruthy();
    expect(selectedBtn?.getAttribute("data-day")).toBe("2026-05-18");
  });

  it("disabled 日期不可點擊", () => {
    const { container } = render(
      <Calendar
        mode="single"
        defaultMonth={new Date(2026, 4, 1)}
        disabled={(date: Date) => date.getDate() === 15}
      />
    );
    const day15Td = container.querySelector(
      "td[data-day='2026-05-15']"
    ) as HTMLElement | null;
    expect(day15Td).toBeTruthy();
    const day15Btn = day15Td?.querySelector("button");
    expect(day15Btn).toBeDisabled();
  });
});

/* ─── 2. Props API ─── */

describe("Calendar props API", () => {
  it("captionLayout='label' 顯示月份文字標題", () => {
    const { container } = render(
      <Calendar mode="single" defaultMonth={new Date(2026, 4, 1)} />
    );
    expect(screen.getByText("2026年5月")).toBeInTheDocument();
    const weekdayHeaders = container.querySelectorAll("th[scope='col']");
    expect(weekdayHeaders.length).toBe(7);
  });

  it("showChevrons={false} 時 navi 不顯示切換按鈕", () => {
    const { container } = render(
      <Calendar
        mode="single"
        defaultMonth={new Date(2026, 4, 1)}
        showChevrons={false}
      />
    );
    const navBtns = container.querySelectorAll("nav button");
    expect(navBtns.length).toBe(0);
  });

  it("非本月日期有 outside data attribute", () => {
    const { container } = render(
      <Calendar mode="single" defaultMonth={new Date(2026, 4, 1)} />
    );
    const outsideTds = container.querySelectorAll("td[data-outside]");
    expect(outsideTds.length).toBeGreaterThan(0);
  });
});

/* ─── 3. fixedWeeks ─── */

describe("Calendar fixedWeeks", () => {
  it("fixedWeeks={true}（預設）固定 6 週", () => {
    const { container } = render(
      <Calendar mode="single" defaultMonth={new Date(2026, 4, 1)} />
    );
    const tbody = container.querySelector("tbody");
    const weekRows = tbody?.querySelectorAll("tr");
    expect(weekRows?.length).toBe(6);
  });
});
