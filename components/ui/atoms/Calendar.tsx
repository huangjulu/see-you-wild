"use client";

import {
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
} from "lucide-react";
import React, { useState } from "react";
import {
  type ClassNames,
  type DayButton as DayButtonType,
  DayPicker,
  type Matcher,
  type MonthCaptionProps,
} from "react-day-picker";
import { zhTW } from "react-day-picker/locale";

import { cn } from "@/lib/utils";

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
} as const;

const FONT_SIZE: Record<CalendarSize, string> = {
  sm: "text-xs",
  md: "",
  lg: "text-base",
} as const;

const LABEL_SIZE: Record<CalendarSize, string> = {
  sm: "text-[.75rem]",
  md: "text-[1rem]",
  lg: "text-xs",
} as const;

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
      className={cn(
        "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col items-center justify-center gap-1 rounded-(--cell-radius) border-0 leading-none font-normal transition-colors duration-150",
        "hover:bg-primary-50 hover:border-primary-100 ",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1",
        "data-[selected-single=true]:bg-primary-50 data-[selected-single=true]:border-primary-300 data-[selected-single=true]:ring data-[selected-single=true]:ring-primary-200",
        "hover:data-[selected-single=true]:bg-primary-100 hover:data-[selected-single=true]:text-primary-500",
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

type CalendarChevronProps = {
  className?: string;
  orientation?: string;
};

function CalendarChevron(props: CalendarChevronProps) {
  if (props.orientation === "left") {
    return <IconChevronLeft className={cn("size-4", props.className)} />;
  }
  return <IconChevronRight className={cn("size-4", props.className)} />;
}

/* ─── Main Component ─── */

const Calendar: React.FC<CalendarProps> = (props) => {
  const size = props.size ?? "md";

  const hasCompactView = props.visibleWeeks != null;
  const [expanded, setExpanded] = useState(!hasCompactView);

  // Extract DayPicker modifiers from markers
  const dpModifiers = props.markers
    ? Object.fromEntries(
        Object.entries(props.markers).map(([name, def]) => [name, def.match])
      )
    : undefined;

  function monthChange() {
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

  const CaptionWithToggle = (
    captionProps: MonthCaptionProps
  ): React.ReactElement => {
    const { calendarMonth: _c, displayIndex: _d, ...divProps } = captionProps;
    return (
      <>
        <div {...divProps} />
        {hasCompactView && !expanded && props.expandLabel != null && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className={cn(
              "w-full rounded-lg bg-primary-50 py-2 text-center typo-ui text-sm text-accent transition-all flex gap-2 items-center justify-center border border-primary-200",
              "hover:bg-primary-100 hover:text-primary-500"
            )}
          >
            {props.expandLabel}
          </button>
        )}
      </>
    );
  };

  const classNames = {
    root: "w-fit",
    months: "relative flex flex-col",
    month: "flex w-full flex-col gap-4",
    nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
    button_previous: cn(
      "flex items-center justify-center size-(--cell-size) rounded-(--cell-radius) p-0",
      "border border-transparent text-foreground hover:bg-primary-100 transition-colors",
      "aria-disabled:opacity-50"
    ),
    button_next: cn(
      "flex items-center justify-center size-(--cell-size) rounded-(--cell-radius) p-0",
      "border border-transparent text-foreground hover:bg-primary-100 transition-colors",
      "aria-disabled:opacity-50"
    ),
    month_caption:
      "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
    caption_label: "typo-ui text-sm font-medium select-none",
    weekdays: "flex",
    weekday:
      "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
    week: "mt-2 flex w-full",
    day: "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none",
    outside: "text-muted-foreground",
    disabled: "text-muted-foreground opacity-50",
    hidden: "invisible",
  } as const satisfies Partial<ClassNames>;

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
      onMonthChange={monthChange}
      className={cn(
        "bg-white p-4 [--cell-radius:var(--radius-md)]",
        CELL_SIZE[size],
        FONT_SIZE[size],
        "rounded-xl overflow-hidden border border-neutral-200",
        props.className
      )}
      classNames={classNames}
      components={{
        Root: (props: DayPickerProps) => {
          const { rootRef, ...rootProps } = props;
          return <div data-slot="calendar" ref={rootRef} {...rootProps} />;
        },
        Chevron: CalendarChevron,
        DayButton: (dayProps: React.ComponentProps<typeof DayButtonType>) => (
          <CalendarDayButton
            markerDefs={props.markers}
            size={size}
            {...dayProps}
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

type DayPickerProps = {
  className?: string;
  rootRef?: React.Ref<HTMLDivElement>;
} & React.HTMLAttributes<HTMLDivElement>;
