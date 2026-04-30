import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import EventSearchBar from "../EventSearchBar";

const typeOptions = ["camping", "hot-spring", "sup"];
const locationOptions = ["阿里山", "栗松溫泉", "花蓮鯉魚潭"];

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
  it("顯示搜尋輸入框", () => {
    render(<EventSearchBar {...baseProps} />);
    expect(screen.getByPlaceholderText(/搜尋/)).toBeInTheDocument();
  });

  it("顯示活動類型篩選 select", () => {
    render(<EventSearchBar {...baseProps} />);
    const typeSelect = screen.getByLabelText(/活動類型/);
    expect(typeSelect).toBeInTheDocument();
  });

  it("顯示地點篩選 select", () => {
    render(<EventSearchBar {...baseProps} />);
    const locationSelect = screen.getByLabelText(/地點/);
    expect(locationSelect).toBeInTheDocument();
  });

  it("輸入搜尋文字觸發 onSearchChange", () => {
    render(<EventSearchBar {...baseProps} />);
    const input = screen.getByPlaceholderText(/搜尋/);
    fireEvent.change(input, { target: { value: "野營" } });
    expect(baseProps.onSearchChange).toHaveBeenCalledWith("野營");
  });

  it("選擇活動類型觸發 onTypeChange", () => {
    render(<EventSearchBar {...baseProps} />);
    const select = screen.getByLabelText(/活動類型/);
    fireEvent.change(select, { target: { value: "camping" } });
    expect(baseProps.onTypeChange).toHaveBeenCalledWith("camping");
  });

  it("選擇地點觸發 onLocationChange", () => {
    render(<EventSearchBar {...baseProps} />);
    const select = screen.getByLabelText(/地點/);
    fireEvent.change(select, { target: { value: "阿里山" } });
    expect(baseProps.onLocationChange).toHaveBeenCalledWith("阿里山");
  });

  it("type select 包含所有 typeOptions", () => {
    render(<EventSearchBar {...baseProps} />);
    const select = screen.getByLabelText(/活動類型/);
    typeOptions.forEach((opt) => {
      expect(
        select.querySelector(`option[value="${opt}"]`)
      ).toBeInTheDocument();
    });
  });

  it("location select 包含所有 locationOptions", () => {
    render(<EventSearchBar {...baseProps} />);
    const select = screen.getByLabelText(/地點/);
    locationOptions.forEach((opt) => {
      expect(
        select.querySelector(`option[value="${opt}"]`)
      ).toBeInTheDocument();
    });
  });
});
