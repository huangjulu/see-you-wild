import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import Calendar from "../Calendar";

describe("Calendar", () => {
  it("single mode 渲染月曆並顯示星期標頭", () => {
    render(<Calendar mode="single" defaultMonth={new Date(2026, 4, 1)} />);
    expect(screen.getByText("一")).toBeInTheDocument();
    expect(screen.getByText("日")).toBeInTheDocument();
    expect(screen.getByText("2026年5月")).toBeInTheDocument();
  });

  it("value 傳入時對應日期有 selected 狀態", () => {
    render(
      <Calendar
        mode="single"
        value={new Date(2026, 4, 18)}
        defaultMonth={new Date(2026, 4, 1)}
      />
    );
    const day18 = screen.getByRole("button", { name: /5月18日/ });
    expect(day18.closest("[data-selected]")).toBeTruthy();
  });

  it("disabled 日期不可點擊", () => {
    render(
      <Calendar
        mode="single"
        defaultMonth={new Date(2026, 4, 1)}
        disabled={(date: Date) => date.getDate() === 15}
      />
    );
    const day15 = screen.getByRole("button", { name: /5月15日/ });
    expect(day15).toBeDisabled();
  });
});

describe("Calendar compact view", () => {
  it("visibleWeeks=2 時只顯示 2 週，其餘 hidden", () => {
    const { container } = render(
      <Calendar
        mode="single"
        defaultMonth={new Date(2026, 4, 1)}
        visibleWeeks={2}
        expandLabel="展開完整月份"
      />
    );
    expect(screen.getByText("展開完整月份")).toBeInTheDocument();
    // getAllByRole("row") 只回傳 accessibility tree 中可見的列；
    // display:none 的 <tr> 被 jsdom 排除，必須用 querySelectorAll 直接查 DOM
    const rows = container.querySelectorAll("tr");
    const hiddenRows = Array.from(rows).filter(
      (r) => r.style.display === "none"
    );
    expect(hiddenRows.length).toBeGreaterThan(0);
  });

  it("點展開按鈕後所有週都顯示，按鈕消失", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Calendar
        mode="single"
        defaultMonth={new Date(2026, 4, 1)}
        visibleWeeks={2}
        expandLabel="展開完整月份"
      />
    );

    await user.click(screen.getByText("展開完整月份"));

    expect(screen.queryByText("展開完整月份")).not.toBeInTheDocument();
    const rows = container.querySelectorAll("tr");
    const hiddenRows = Array.from(rows).filter(
      (r) => r.style.display === "none"
    );
    expect(hiddenRows.length).toBe(0);
  });
});
