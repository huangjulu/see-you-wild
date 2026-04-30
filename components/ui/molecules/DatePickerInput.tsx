"use client";

import { Calendar as IconCalendar } from "lucide-react";
import { ChevronDownIcon } from "lucide-react";
import React, { useState } from "react";
import type { DropdownProps } from "react-day-picker";
import { zhTW } from "react-day-picker/locale";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  startYear?: number;
  endYear?: number;
}

const DatePickerInput: React.FC<DatePickerInputProps> = (props) => {
  const [open, setOpen] = useState(false);

  const startYear = props.startYear ?? 1930;
  const endYear = props.endYear ?? new Date().getFullYear();

  const selectedDate = props.value
    ? new Date(props.value + "T00:00:00")
    : undefined;

  function handleSelect(date: Date | undefined) {
    if (date == null) return;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    props.onChange?.(`${yyyy}-${mm}-${dd}`);
    setOpen(false);
    props.onBlur?.();
  }

  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="flex flex-col gap-1">
      {props.label != null && (
        <span className="typo-ui text-sm text-primary">{props.label}</span>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={props.disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border px-4 text-left typo-body transition-colors",
            "border-stroke-default bg-white text-primary ring-stroke-focus",
            "hover:border-stroke-strong hover:disabled:border-stroke-default",
            "focus:border-accent focus:ring-2 focus:ring-brand-200/70 focus-visible:outline-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            props.error != null &&
              "border-error ring-error/20 focus:border-error",
            !displayValue && "text-neutral-200"
          )}
        >
          <span>{displayValue || props.placeholder}</span>
          <IconCalendar className="size-4 text-secondary" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            captionLayout="dropdown"
            defaultMonth={selectedDate ?? new Date(2000, 0)}
            startMonth={new Date(startYear, 0)}
            endMonth={new Date(endYear, 11)}
            locale={zhTW}
            components={{
              Dropdown: CalendarSelectDropdown,
            }}
          />
        </PopoverContent>
      </Popover>
      {props.error != null && (
        <p className="typo-ui text-xs text-critical">{props.error}</p>
      )}
    </div>
  );
};

DatePickerInput.displayName = "DatePickerInput";
export default DatePickerInput;

/* ─── Calendar dropdown override ─── */

function CalendarSelectDropdown(props: DropdownProps): React.JSX.Element {
  const { options, value, onChange, "aria-label": ariaLabel } = props;
  const [listOpen, setListOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedLabel = options?.find(
    (o) => o.value.toString() === value?.toString()
  )?.label;

  function handlePick(optionValue: number) {
    onChange?.({
      target: { value: optionValue.toString() },
    } as React.ChangeEvent<HTMLSelectElement>);
    setListOpen(false);
  }

  function handleBlur(e: React.FocusEvent) {
    if (containerRef.current?.contains(e.relatedTarget)) return;
    setListOpen(false);
  }

  return (
    <div ref={containerRef} className="relative" onBlur={handleBlur}>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setListOpen((prev) => !prev)}
        className={cn(
          "flex h-7 items-center gap-1 rounded-md border border-stroke-default bg-white px-2 text-sm transition-colors",
          "hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200/70"
        )}
      >
        <span>{selectedLabel ?? value}</span>
        <ChevronDownIcon className="size-3 text-secondary" />
      </button>
      {listOpen && (
        <div className="absolute top-full left-0 z-[200] mt-1 max-h-52 min-w-20 overflow-y-auto rounded-lg bg-white p-1 shadow-lg ring-1 ring-primary/10">
          {options?.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={option.disabled}
              onClick={() => handlePick(option.value)}
              className={cn(
                "flex w-full items-center rounded-md px-2 py-1 text-left text-sm select-none",
                "hover:bg-brand-50 focus:bg-brand-50 focus:outline-none",
                "disabled:opacity-50 disabled:pointer-events-none",
                option.value.toString() === value?.toString() &&
                  "bg-brand-50 font-medium"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
