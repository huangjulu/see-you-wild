"use client";

import React, { useMemo } from "react";
import Calendar from "@/components/ui/atoms/Calendar";

/* ─── Types ─── */

type CalendarSize = "sm" | "md" | "lg";

interface EventCalendarProps {
  size?: CalendarSize;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  availableDates?: Date[];
  minAdvanceDays?: number;
  visibleWeeks?: 1 | 2 | 3 | 4;
  expandLabel?: string;
  defaultMonth?: Date;
  className?: string;
}

/* ─── Main Component ─── */

const EventCalendar: React.FC<EventCalendarProps> = (props) => {
  const { availableDates, minAdvanceDays } = props;

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

  // Build markers with match + label + style
  const markers = useMemo(() => {
    if (fullMatcher == null || availableMatcher == null) return undefined;
    return {
      full: {
        match: fullMatcher,
        label: "客滿",
        style: "pointer-events-none cursor-default text-muted-foreground",
      },
      available: {
        match: availableMatcher,
        label: "可供選擇",
        style: "text-primary-500",
      },
      selected: {
        match: (date: Date) =>
          props.value != null && isSameDay(props.value, date),
        label: "已選擇",
        style: "text-primary-800 bg-primary-200",
      },
    };
  }, [fullMatcher, availableMatcher, props.value]);

  // Block non-available dates from being selected
  function handleChange(date: Date | undefined) {
    if (
      date != null &&
      availableDates != null &&
      !availableDates.some((d) => isSameDay(d, date))
    ) {
      return;
    }
    props.onChange?.(date);
  }

  return (
    <Calendar
      mode="single"
      size={props.size}
      value={props.value}
      onChange={handleChange}
      disabled={disabled}
      defaultMonth={props.defaultMonth}
      className={props.className}
      markers={markers}
      visibleWeeks={props.visibleWeeks}
      expandLabel={props.expandLabel}
    />
  );
};

EventCalendar.displayName = "EventCalendar";
export default EventCalendar;

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
