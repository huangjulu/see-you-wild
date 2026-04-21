"use client";

import React, { useMemo } from "react";
import { zhTW } from "react-day-picker/locale";
import type { DateRange, DayButton } from "react-day-picker";
import {
  Calendar as ShadcnCalendar,
  CalendarDayButton,
} from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type CalendarSize = "sm" | "md" | "lg";

interface CalendarProps {
  mode: "single" | "range";
  size?: CalendarSize;
  selected?: Date | { from: Date; to: Date };
  onSelect?: (value: Date | { from: Date; to: Date } | undefined) => void;
  availableDates?: Date[];
  minAdvanceDays?: number;
  defaultMonth?: Date;
  className?: string;
}

const Calendar: React.FC<CalendarProps> = (props) => {
  const { availableDates, minAdvanceDays } = props;
  const size = props.size ?? "md";
  const hasAvailableDates = availableDates != null;

  const minDate = useMemo(() => {
    if (minAdvanceDays == null) return startOfDay(new Date());
    return addDays(new Date(), minAdvanceDays);
  }, [minAdvanceDays]);

  // Only past + too-soon dates are disabled
  // Full dates (3天後 but not in availableDates) use pointer-events-none instead
  const disabled = useMemo(() => {
    return (date: Date) => date < minDate;
  }, [minDate]);

  // "客滿" modifier: 3天後 + not in availableDates
  const fullMatcher = useMemo(() => {
    if (availableDates == null) return undefined;
    return (date: Date) => {
      if (date < minDate) return false;
      return !availableDates.some((d) => isSameDay(d, date));
    };
  }, [availableDates, minDate]);

  // "可供選擇" modifier: in availableDates + past minDate
  const availableMatcher = useMemo(() => {
    if (availableDates == null) return undefined;
    return (date: Date) => {
      if (date < minDate) return false;
      return availableDates.some((d) => isSameDay(d, date));
    };
  }, [availableDates, minDate]);

  const modifiers = {
    ...(fullMatcher != null && { full: fullMatcher }),
    ...(availableMatcher != null && { available: availableMatcher }),
  };

  const labelClass = cn(
    "after:block after:leading-none after:no-underline",
    LABEL_SIZE[size]
  );

  const todayDotClass = cn(
    "relative font-semibold",
    "before:absolute before:bottom-1.5 before:left-1/2 before:-translate-x-1/2 before:size-2 before:rounded-full before:bg-accent before:content-['']"
  );

  const calendarStyle = hasAvailableDates
    ? ({
        "--calendar-full-label": '"客滿"',
        "--calendar-available-label": '"可供選擇"',
        "--calendar-selected-label": '"已選擇"',
      } as React.CSSProperties)
    : undefined;

  const selectedDate =
    props.selected instanceof Date ? props.selected : undefined;

  function CustomDayButton(
    buttonProps: React.ComponentProps<typeof DayButton>
  ) {
    const isFull =
      "full" in buttonProps.modifiers && buttonProps.modifiers.full === true;
    const isAvailable =
      "available" in buttonProps.modifiers &&
      buttonProps.modifiers.available === true;
    const isToday = buttonProps.modifiers.today === true;
    const isSelected =
      selectedDate != null &&
      buttonProps.day?.date != null &&
      isSameDay(selectedDate, buttonProps.day.date);

    return (
      <CalendarDayButton
        {...buttonProps}
        className={cn(
          buttonProps.className,
          "hover:bg-primary-100!",
          size === "lg" && "justify-start pt-2",
          isToday && todayDotClass,
          isFull &&
            cn(
              "pointer-events-none cursor-default",
              "after:content-[var(--calendar-full-label)] after:text-muted-foreground",
              labelClass
            ),
          isAvailable &&
            !isSelected &&
            cn(
              "text-primary-500",
              "after:content-[var(--calendar-available-label)] after:text-primary-500",
              labelClass
            ),
          isSelected &&
            cn(
              "text-primary-800! bg-primary-200!",
              "after:content-[var(--calendar-selected-label)] after:text-primary-800",
              labelClass
            )
        )}
      />
    );
  }

  const sharedProps = {
    disabled,
    defaultMonth: props.defaultMonth,
    locale: zhTW,
    className: cn(
      CELL_SIZE[size],
      FONT_SIZE[size],
      "rounded-xl overflow-hidden border border-border",
      props.className
    ),
    style: calendarStyle,
    modifiers,
    components: {
      DayButton: CustomDayButton,
    },
  };

  if (props.mode === "range") {
    const rangeSelected: DateRange | undefined =
      props.selected != null && !(props.selected instanceof Date)
        ? { from: props.selected.from, to: props.selected.to }
        : undefined;

    return (
      <ShadcnCalendar
        mode="range"
        selected={rangeSelected}
        onSelect={(range) => {
          if (range?.from != null && range?.to != null) {
            props.onSelect?.({ from: range.from, to: range.to });
          } else {
            props.onSelect?.(undefined);
          }
        }}
        {...sharedProps}
      />
    );
  }

  const singleSelected: Date | undefined =
    props.selected instanceof Date ? props.selected : undefined;

  return (
    <ShadcnCalendar
      mode="single"
      selected={singleSelected}
      onSelect={(date) => {
        if (
          date != null &&
          availableDates != null &&
          !availableDates.some((d) => isSameDay(d, date))
        )
          return;
        props.onSelect?.(date);
      }}
      {...sharedProps}
    />
  );
};

Calendar.displayName = "Calendar";
export default Calendar;

const CELL_SIZE: Record<CalendarSize, string> = {
  sm: "[--cell-size:--spacing(6)]",
  md: "",
  lg: "[--cell-size:--spacing(12)]",
};

const FONT_SIZE: Record<CalendarSize, string> = {
  sm: "text-xs",
  md: "",
  lg: "text-base",
};

const LABEL_SIZE: Record<CalendarSize, string> = {
  sm: "after:text-[8px]",
  md: "after:text-[10px]",
  lg: "after:text-xs",
};

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  result.setHours(0, 0, 0, 0);
  return result;
}

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}
