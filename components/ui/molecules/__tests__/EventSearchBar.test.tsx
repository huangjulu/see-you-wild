import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import EventSearchBar from "../EventSearchBar";

const messages = {
  events: {
    allTypes: "所有類型",
    allLocations: "所有地點",
    type: {
      camping: "野營私廚",
      "hot-spring": "野溪溫泉",
      sup: "SUP 立槳",
    },
  },
};

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="zh-TW" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

const typeOptions = ["camping", "hot-spring", "sup"];
const locationOptions = [
  { value: "", label: "所有地點" },
  { value: "阿里山", label: "阿里山" },
  { value: "栗松溫泉", label: "栗松溫泉" },
];

const baseProps = {
  typeOptions,
  locationOptions,
  selectedType: "",
  selectedLocation: "",
  searchQuery: "",
  onTypeChange: vi.fn(),
  onLocationChange: vi.fn(),
  onSearchChange: vi.fn(),
};

describe("EventSearchBar", () => {
  it("顯示活動類型選項", () => {
    renderWithIntl(<EventSearchBar {...baseProps} />);
    expect(screen.getAllByText("所有類型").length).toBeGreaterThan(0);
  });

  it("type options 包含翻譯後的 label", () => {
    renderWithIntl(<EventSearchBar {...baseProps} />);
    expect(screen.getAllByText("野營私廚").length).toBeGreaterThan(0);
    expect(screen.getAllByText("野溪溫泉").length).toBeGreaterThan(0);
    expect(screen.getAllByText("SUP 立槳").length).toBeGreaterThan(0);
  });

  it("選擇活動類型觸發 onTypeChange（pill）", async () => {
    const user = userEvent.setup();
    const onTypeChange = vi.fn();
    renderWithIntl(
      <EventSearchBar {...baseProps} onTypeChange={onTypeChange} />
    );
    const pills = screen.getAllByText("野營私廚");
    await user.click(pills[0]);
    expect(onTypeChange).toHaveBeenCalledWith("camping");
  });
});
