import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import Calendar from "../Calendar";

/* ─── 1. Default (no children) ─── */

describe("Calendar（無 children = default）", () => {
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
    // CalendarDayButton sets data-selected-single="true" on the button
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
    // rdp sets disabled on the button inside the td, not the td itself
    const day15Td = container.querySelector(
      "td[data-day='2026-05-15']"
    ) as HTMLElement | null;
    expect(day15Td).toBeTruthy();
    const day15Btn = day15Td?.querySelector("button");
    expect(day15Btn).toBeDisabled();
  });
});

/* ─── 2. Slot API ─── */

describe("Calendar slot API", () => {
  it("Navi + Chevrons + Caption(label) + Grid(month) 完整組合渲染", () => {
    const { container } = render(
      <Calendar mode="single" defaultMonth={new Date(2026, 4, 1)}>
        <Calendar.Navi>
          <Calendar.Chevrons />
          <Calendar.Caption layout="label" />
        </Calendar.Navi>
        <Calendar.Grid type="month" />
      </Calendar>
    );
    expect(screen.getByText("2026年5月")).toBeInTheDocument();
    const weekdayHeaders = container.querySelectorAll("th[scope='col']");
    expect(weekdayHeaders.length).toBe(7);
  });

  it("不傳 Chevrons 時 navi 不顯示切換按鈕", () => {
    const { container } = render(
      <Calendar mode="single" defaultMonth={new Date(2026, 4, 1)}>
        <Calendar.Navi>
          <Calendar.Caption layout="label" />
        </Calendar.Navi>
        <Calendar.Grid type="month" />
      </Calendar>
    );
    const navBtns = container.querySelectorAll("nav button");
    expect(navBtns.length).toBe(0);
  });

  it("非本月日期有 outside data attribute", () => {
    const { container } = render(
      <Calendar mode="single" defaultMonth={new Date(2026, 4, 1)}>
        <Calendar.Navi>
          <Calendar.Chevrons />
          <Calendar.Caption layout="label" />
        </Calendar.Navi>
        <Calendar.Grid type="month" />
      </Calendar>
    );
    const outsideTds = container.querySelectorAll("td[data-outside]");
    expect(outsideTds.length).toBeGreaterThan(0);
  });
});

/* ─── 3. Calendar Grid type ─── */

describe("Calendar Grid type", () => {
  it("type='month' 時 fixedWeeks 固定 6 週", () => {
    const { container } = render(
      <Calendar mode="single" defaultMonth={new Date(2026, 4, 1)}>
        <Calendar.Grid type="month" />
      </Calendar>
    );
    // fixedWeeks=true when gridType === "month" → always 6 tbody week rows
    const tbody = container.querySelector("tbody");
    const weekRows = tbody?.querySelectorAll("tr");
    expect(weekRows?.length).toBe(6);
  });

  it("type='biweek' 時只顯示 2 週，其餘 hidden", () => {
    const { container } = render(
      <Calendar mode="single" defaultMonth={new Date(2026, 4, 1)}>
        <Calendar.Grid type="biweek" expandLabel="展開完整月份" />
      </Calendar>
    );
    expect(screen.getByText("展開完整月份")).toBeInTheDocument();
    const rows = container.querySelectorAll("tr");
    const hiddenRows = Array.from(rows).filter((r) =>
      r.classList.contains("hidden")
    );
    expect(hiddenRows.length).toBeGreaterThan(0);
  });

  it("點展開按鈕後所有週都顯示，按鈕消失", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Calendar mode="single" defaultMonth={new Date(2026, 4, 1)}>
        <Calendar.Grid type="biweek" expandLabel="展開完整月份" />
      </Calendar>
    );

    await user.click(screen.getByText("展開完整月份"));

    expect(screen.queryByText("展開完整月份")).not.toBeInTheDocument();
    const rows = container.querySelectorAll("tr");
    const hiddenRows = Array.from(rows).filter((r) =>
      r.classList.contains("hidden")
    );
    expect(hiddenRows.length).toBe(0);
  });
});
