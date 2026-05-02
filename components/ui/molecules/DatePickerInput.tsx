"use client";

import { Calendar as IconCalendar } from "lucide-react";
import React, { useState } from "react";

import Calendar from "@/components/ui/atoms/Calendar";
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
        <PopoverContent className="w-auto rounded-xl p-0 ring-0">
          <Calendar
            mode="single"
            size="sm"
            value={selectedDate}
            onChange={handleSelect}
            defaultMonth={selectedDate ?? new Date(2000, 0)}
            startMonth={new Date(startYear, 0)}
            endMonth={new Date(endYear, 11)}
          >
            <Calendar.Navi>
              <Calendar.Chevrons />
              <Calendar.Caption layout="dropdown" />
            </Calendar.Navi>
            <Calendar.Grid type="month" />
          </Calendar>
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
