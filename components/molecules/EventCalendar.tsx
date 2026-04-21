"use client";

import React, { useMemo, useState } from "react";
import { zhTW } from "react-day-picker/locale";
import type { DateRange, DayButton } from "react-day-picker";
import {
  Calendar as ShadcnCalendar,
  CalendarDayButton,
} from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type CalendarSize = "sm" | "md" | "lg";
type VisibleWeeks = 1 | 2 | 3 | 4 | "all";

interface EventCalendarProps {
  mode: "single" | "range";
  size?: CalendarSize;
  selected?: Date | { from: Date; to: Date };
  onSelect?: (value: Date | { from: Date; to: Date } | undefined) => void;
  availableDates?: Date[];
  minAdvanceDays?: number;
  visibleWeeks?: VisibleWeeks;
  expandLabel?: string;
  collapseLabel?: string;
  defaultMonth?: Date;
  className?: string;
}

const EventCalendar: React.FC<EventCalendarProps> = (props) => {
  const { availableDates, minAdvanceDays } = props;
  const size = props.size ?? "md";
  const hasAvailableDates = availableDates != null;
  const defaultVisibleWeeks = props.visibleWeeks ?? "all";
  const monthMode = defaultVisibleWeeks === "all";

  const [expanded, setExpanded] = useState(monthMode);

  const activeWeeks =
    expanded || defaultVisibleWeeks === "all" ? null : defaultVisibleWeeks;

  const minDate = useMemo(() => {
    if (minAdvanceDays == null) return startOfDay(new Date());
    return addDays(new Date(), minAdvanceDays);
  }, [minAdvanceDays]);

  const disabled = useMemo(() => {
    return (date: Date) => date < minDate;
  }, [minDate]);

  const fullMatcher = useMemo(() => {
    if (availableDates == null) return undefined;
    return (date: Date) => {
      if (date < minDate) return false;
      return !availableDates.some((d) => isSameDay(d, date));
    };
  }, [availableDates, minDate]);

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

  // Anchor for compact week calculation
  const anchorDate = useMemo(() => {
    if (activeWeeks == null || availableDates == null) return null;
    const today = new Date();
    const nearest = availableDates
      .filter((d) => d >= today)
      .sort((a, b) => a.getTime() - b.getTime())[0];
    return nearest ?? null;
  }, [activeWeeks, availableDates]);

  const anchorWeekStart = useMemo(() => {
    if (anchorDate == null) return null;
    return getMonday(anchorDate);
  }, [anchorDate]);

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
              "after:content-(--calendar-full-label) after:text-muted-foreground",
              labelClass
            ),
          isAvailable &&
            !isSelected &&
            cn(
              "text-primary-500",
              "after:content-(--calendar-available-label) after:text-primary-500",
              labelClass
            ),
          isSelected &&
            cn(
              "text-primary-800! bg-primary-200!",
              "after:content-(--calendar-selected-label) after:text-primary-800",
              labelClass
            )
        )}
      />
    );
  }

  function CustomWeek(
    weekProps: React.HTMLAttributes<HTMLTableRowElement> & {
      week: { days: { date: Date }[] };
    }
  ) {
    const { week, ...trProps } = weekProps;

    if (activeWeeks != null && anchorWeekStart != null) {
      const weekMonday = getMonday(week.days[0].date);
      const diffWeeks = Math.floor(
        (weekMonday.getTime() - anchorWeekStart.getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      );
      const hidden = diffWeeks < 0 || diffWeeks >= activeWeeks;
      return (
        <tr {...trProps} style={hidden ? { display: "none" } : undefined} />
      );
    }

    return <tr {...trProps} />;
  }

  // Expand/collapse banner — only shown when visibleWeeks is not "all"
  const showToggle = !monthMode;
  const toggleLabel = expanded ? props.collapseLabel : props.expandLabel;

  function CustomMonthCaption(
    captionProps: React.HTMLAttributes<HTMLDivElement> & {
      calendarMonth: unknown;
      displayIndex: number;
    }
  ) {
    const { calendarMonth, displayIndex, ...divProps } = captionProps;
    return (
      <>
        <div {...divProps} />
        {showToggle && toggleLabel != null && (
          <button
            type="button"
            onClick={function handleToggle() {
              setExpanded((prev) => !prev);
            }}
            className="w-full rounded-lg bg-primary-50 py-2 text-center typo-ui text-sm text-accent hover:bg-primary-100 transition-colors"
          >
            {toggleLabel}
          </button>
        )}
      </>
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
      Week: CustomWeek,
      MonthCaption: CustomMonthCaption,
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

EventCalendar.displayName = "EventCalendar";
export default EventCalendar;

/* ─── Constants ─── */

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

/* ─── Helpers ─── */

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

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const offset = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - offset);
  d.setHours(0, 0, 0, 0);
  return d;
}
