"use client";

import React, { useState } from "react";
import {
  DayPicker,
  type DayButton as DayButtonType,
  type Matcher,
} from "react-day-picker";
import { zhTW } from "react-day-picker/locale";
import { cn } from "@/lib/utils";
import {
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
} from "lucide-react";

/* ─── Types ─── */

type CalendarSize = "sm" | "md" | "lg";

interface MarkerDef {
  match: Matcher;
  label?: string;
  style?: string;
}

interface CalendarProps {
  mode: "single";
  size?: CalendarSize;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  defaultMonth?: Date;
  className?: string;
  disabled?: Matcher | Matcher[];
  markers?: Record<string, MarkerDef>;
  visibleWeeks?: 1 | 2 | 3 | 4;
  expandLabel?: string;
}

/* ─── Size Constants ─── */

const CELL_SIZE: Record<CalendarSize, string> = {
  sm: "[--cell-size:--spacing(6)]",
  md: "[--cell-size:--spacing(7)]",
  lg: "[--cell-size:--spacing(12)]",
};

const FONT_SIZE: Record<CalendarSize, string> = {
  sm: "text-xs",
  md: "",
  lg: "text-base",
};

const LABEL_SIZE: Record<CalendarSize, string> = {
  sm: "text-[8px]",
  md: "text-[10px]",
  lg: "text-xs",
};

/* ─── CalendarDayButton ─── */

interface CalendarDayButtonProps extends React.ComponentProps<
  typeof DayButtonType
> {
  markerDefs?: Record<string, MarkerDef>;
  size: CalendarSize;
}

function CalendarDayButton(props: CalendarDayButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(
    function focusOnModifier() {
      if (props.modifiers.focused) ref.current?.focus();
    },
    [props.modifiers.focused]
  );

  const { day, modifiers, className, markerDefs, size, ...rest } = props;

  // Resolve active markers: find which markers are true for this day
  const activeMarkers =
    markerDefs != null
      ? Object.entries(markerDefs).filter(([name]) => modifiers[name] === true)
      : [];

  // First active marker with a label wins
  const activeLabel = activeMarkers.find(([, def]) => def.label != null)?.[1];
  // Collect all active marker styles
  const markerStyles = activeMarkers
    .map(([, def]) => def.style)
    .filter(Boolean);

  return (
    <button
      ref={ref}
      // Hydration fix: manual ISO string instead of toLocaleDateString
      data-day={`${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, "0")}-${String(day.date.getDate()).padStart(2, "0")}`}
      data-selected-single={modifiers.selected}
      data-today={modifiers.today}
      className={cn(
        "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col items-center justify-center gap-1 rounded-(--cell-radius) border-0 leading-none font-normal transition-colors select-none",
        "hover:bg-primary-100",
        "data-[selected-single=true]:bg-primary-200 data-[selected-single=true]:text-primary-800",
        "data-[today=true]:font-semibold",
        "data-[today=true]:before:absolute data-[today=true]:before:bottom-1.5 data-[today=true]:before:left-1/2 data-[today=true]:before:-translate-x-1/2 data-[today=true]:before:size-2 data-[today=true]:before:rounded-full data-[today=true]:before:bg-accent data-[today=true]:before:content-['']",
        size === "lg" && "justify-start pt-2",
        ...markerStyles,
        className
      )}
      {...rest}
    >
      {rest.children}
      {activeLabel?.label != null && (
        <span className={cn("block leading-none", LABEL_SIZE[size])}>
          {activeLabel.label}
        </span>
      )}
    </button>
  );
}

CalendarDayButton.displayName = "CalendarDayButton";

/* ─── Internal Components ─── */

function CalendarChevron(
  props: {
    className?: string;
    orientation?: string;
  } & React.SVGProps<SVGSVGElement>
) {
  const { className, orientation, ...rest } = props;
  if (orientation === "left") {
    return <IconChevronLeft className={cn("size-4", className)} {...rest} />;
  }
  return <IconChevronRight className={cn("size-4", className)} {...rest} />;
}

/* ─── Main Component ─── */

const Calendar: React.FC<CalendarProps> = (props) => {
  const size = props.size ?? "md";

  const hasCompactView = props.visibleWeeks != null;
  const [expanded, setExpanded] = useState(!hasCompactView);

  // Extract DayPicker modifiers from markers
  const dpModifiers =
    props.markers != null
      ? Object.fromEntries(
          Object.entries(props.markers).map(([name, def]) => [name, def.match])
        )
      : undefined;

  function handleMonthChange() {
    if (hasCompactView && !expanded) {
      setExpanded(true);
    }
  }

  function CompactWeek(
    weekProps: React.HTMLAttributes<HTMLTableRowElement> & {
      week: { weekNumber: number; days: { date: Date }[] };
    }
  ) {
    const { week, ...trProps } = weekProps;

    if (!expanded && props.visibleWeeks != null) {
      const firstDayOfWeek = week.days[0].date;
      const monthStart = new Date(
        firstDayOfWeek.getFullYear(),
        firstDayOfWeek.getMonth(),
        1
      );
      const anchorWeekStart = getAnchorWeekStart(dpModifiers, monthStart);
      const weekMonday = getMonday(firstDayOfWeek);
      const diffWeeks = Math.round(
        (weekMonday.getTime() - anchorWeekStart.getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      );
      const hidden = diffWeeks < 0 || diffWeeks >= props.visibleWeeks;

      return (
        <tr {...trProps} style={hidden ? { display: "none" } : undefined} />
      );
    }

    return <tr {...trProps} />;
  }

  function CaptionWithToggle(
    captionProps: React.HTMLAttributes<HTMLDivElement> & {
      calendarMonth: unknown;
      displayIndex: number;
    }
  ) {
    const { calendarMonth, displayIndex, ...divProps } = captionProps;
    return (
      <>
        <div {...divProps} />
        {hasCompactView && !expanded && props.expandLabel != null && (
          <button
            type="button"
            onClick={function handleExpand() {
              setExpanded(true);
            }}
            className="w-full rounded-lg bg-primary-50 py-2 text-center typo-ui text-sm text-accent hover:bg-primary-100 transition-colors"
          >
            {props.expandLabel}
          </button>
        )}
      </>
    );
  }

  const classNames = {
    root: "w-fit",
    months: "relative flex flex-col",
    month: "flex w-full flex-col gap-4",
    nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
    button_previous: cn(
      "flex items-center justify-center size-(--cell-size) rounded-(--cell-radius) p-0 select-none",
      "border border-transparent text-foreground hover:bg-primary-100 transition-colors",
      "aria-disabled:opacity-50"
    ),
    button_next: cn(
      "flex items-center justify-center size-(--cell-size) rounded-(--cell-radius) p-0 select-none",
      "border border-transparent text-foreground hover:bg-primary-100 transition-colors",
      "aria-disabled:opacity-50"
    ),
    month_caption:
      "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
    caption_label: "typo-ui text-sm font-medium select-none",
    table: "w-full border-collapse",
    weekdays: "flex",
    weekday:
      "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
    week: "mt-2 flex w-full",
    day: "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none",
    today: "rounded-(--cell-radius) bg-transparent text-foreground",
    outside: "text-muted-foreground",
    disabled: "text-muted-foreground opacity-50",
    hidden: "invisible",
  };

  return (
    <DayPicker
      mode="single"
      selected={props.value}
      onSelect={props.onChange}
      showOutsideDays
      locale={zhTW}
      defaultMonth={props.defaultMonth}
      disabled={props.disabled}
      modifiers={dpModifiers}
      onMonthChange={handleMonthChange}
      className={cn(
        "bg-background p-2 [--cell-radius:var(--radius-md)]",
        CELL_SIZE[size],
        FONT_SIZE[size],
        "rounded-xl overflow-hidden border border-border",
        props.className
      )}
      classNames={classNames}
      components={{
        Root: ({
          className: rootClassName,
          rootRef,
          ...rootProps
        }: {
          className?: string;
          rootRef?: React.Ref<HTMLDivElement>;
        } & React.HTMLAttributes<HTMLDivElement>) => (
          <div
            data-slot="calendar"
            ref={rootRef}
            className={cn(rootClassName)}
            {...rootProps}
          />
        ),
        Chevron: CalendarChevron,
        DayButton: (dayProps: React.ComponentProps<typeof DayButtonType>) => (
          <CalendarDayButton
            {...dayProps}
            markerDefs={props.markers}
            size={size}
          />
        ),
        Week: CompactWeek,
        MonthCaption: CaptionWithToggle,
      }}
    />
  );
};

Calendar.displayName = "Calendar";
export default Calendar;

/* ─── Helpers ─── */

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const offset = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getAnchorWeekStart(
  modifiers: Record<string, Matcher> | undefined,
  monthStart: Date
): Date {
  if (
    modifiers?.available != null &&
    typeof modifiers.available === "function"
  ) {
    const monthEnd = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (
      let d = new Date(Math.max(today.getTime(), monthStart.getTime()));
      d <= monthEnd;
      d.setDate(d.getDate() + 1)
    ) {
      // react-day-picker Matcher is a union type. typeof === "function" narrows at runtime
      // but TS can't narrow through Record access — this is a necessary bridge cast.
      if ((modifiers.available as (date: Date) => boolean)(new Date(d))) {
        return getMonday(d);
      }
    }
  }

  return getMonday(monthStart);
}
