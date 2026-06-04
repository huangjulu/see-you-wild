"use client";

import React, { useMemo } from "react";

import Calendar from "@/components/ui/atoms/Calendar";
import { useTranslations } from "@/lib/i18n/client";

type BaseCalendarProps = React.ComponentProps<typeof Calendar>;

interface EventCalendarProps extends Pick<
  BaseCalendarProps,
  "size" | "value" | "onChange" | "defaultMonth" | "className"
> {
  availableDates?: Date[];
  minAdvanceDays?: number;
}

const EventCalendar = (props: EventCalendarProps) => {
  const t = useTranslations("eventDetail");
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

  const markers = useMemo(() => {
    if (fullMatcher == null || availableMatcher == null) return undefined;
    return {
      full: {
        match: fullMatcher,
        label: t("calendarFull"),
        style: "pointer-events-none cursor-default text-neutral-400/40",
      },
      available: {
        match: availableMatcher,
        label: t("calendarAvailable"),
        style: "text-primary",
      },
    };
  }, [fullMatcher, availableMatcher, props.value]);

  const changeDate = (date: Date | undefined) => {
    if (
      date &&
      props.availableDates &&
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
