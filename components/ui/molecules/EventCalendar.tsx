"use client";

import React, { useMemo } from "react";

import Calendar from "@/components/ui/atoms/Calendar";
import { cn } from "@/lib/utils";

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

const EventCalendar: React.FC<EventCalendarProps> = (props) => {
  const minDate = useMemo(() => {
    if (props.minAdvanceDays == null) return startOfDay(new Date());
    return addDays(new Date(), props.minAdvanceDays);
  }, [props.minAdvanceDays]);

  const disabled = useMemo(() => {
    return (date: Date) => date < minDate;
  }, [minDate]);

  const fullMatcher = useMemo(() => {
    if (props.availableDates == null) return undefined;
    const dates = props.availableDates;
    return (date: Date) => {
      if (date < minDate) return false;
      return !dates.some((d) => isSameDay(d, date));
    };
  }, [props.availableDates, minDate]);

  const availableMatcher = useMemo(() => {
    if (props.availableDates == null) return undefined;
    const dates = props.availableDates;
    return (date: Date) => {
      if (date < minDate) return false;
      return dates.some((d) => isSameDay(d, date));
    };
  }, [props.availableDates, minDate]);

  // Build markers with match + label + style
  const markers = useMemo(() => {
    if (fullMatcher == null || availableMatcher == null) return undefined;
    return {
      full: {
        match: fullMatcher,
        label: "客滿",
        style: "pointer-events-none cursor-default text-gray-400",
      },
      available: {
        match: availableMatcher,
        label: "可選擇",
        style: "text-accent",
      },
    };
  }, [fullMatcher, availableMatcher, props.value]);

  // Block non-available dates from being selected
  const changeDate = (date: Date | undefined) => {
    if (
      date != null &&
      props.availableDates != null &&
      !props.availableDates.some((d) => isSameDay(d, date))
    ) {
      return;
    }
    props.onChange?.(date);
  };

  return (
    <Calendar
      mode="single"
      size={props.size}
      value={props.value}
      onChange={changeDate}
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
