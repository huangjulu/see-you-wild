"use client";

import {
  ChevronDown as IconChevronDown,
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
} from "lucide-react";
import React, { useRef, useState } from "react";
import {
  type ClassNames,
  type DayButton as DayButtonType,
  DayPicker,
  type DropdownOption,
  type Matcher,
  type NavProps,
} from "react-day-picker";
import { zhTW } from "react-day-picker/locale";

import { useOutsideClick } from "@/lib/hooks/useOutsideClick";
import { cn } from "@/lib/utils";

type CalendarSize = "sm" | "md" | "lg";

type CaptionLayout = "label" | "dropdown";

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
  startMonth?: Date;
  endMonth?: Date;
  captionLayout?: CaptionLayout;
  fixedWeeks?: boolean;
  showChevrons?: boolean;
}

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

const Calendar = (props: CalendarProps) => {
  const size = props.size ?? "md";
  const captionLayout = props.captionLayout ?? "label";
  const fixedWeeks = props.fixedWeeks ?? true;
  const showChevrons = props.showChevrons ?? true;

  const dpModifiers = props.markers
    ? Object.fromEntries(
        Object.entries(props.markers).map(([name, def]) => [name, def.match])
      )
    : undefined;

  function CalendarChevronInternal(chevronProps: {
    className?: string;
    orientation?: string;
  }) {
    if (chevronProps.orientation === "left") {
      return (
        <IconChevronLeft className={cn("size-4", chevronProps.className)} />
      );
    }
    return (
      <IconChevronRight className={cn("size-4", chevronProps.className)} />
    );
  }

  function EmptyNav(navProps: NavProps) {
    const {
      onPreviousClick: _op,
      onNextClick: _on,
      previousMonth: _pm,
      nextMonth: _nm,
      ...divProps
    } = navProps;
    return <nav {...divProps} />;
  }

  const classNames = {
    root: "w-full",
    months: "relative flex flex-col",
    month: "flex w-full flex-col gap-4",
    nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-2",
    button_previous: cn(
      "flex items-center justify-center size-(--cell-size) rounded-(--cell-radius)",
      "border border-transparent text-primary hover:bg-brand-50 transition-colors",
      "aria-disabled:opacity-50"
    ),
    button_next: cn(
      "flex items-center justify-center size-(--cell-size) rounded-(--cell-radius)",
      "border border-transparent text-primary hover:bg-brand-50 transition-colors",
      "aria-disabled:opacity-50"
    ),
    month_caption:
      "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
    dropdowns: "flex flex-row gap-1 px-2",
    caption_label: "typo-ui text-sm font-medium select-none",
    month_grid: "w-full table-fixed",
    weekdays: "flex",
    weekday:
      "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
    week: "mt-2 flex w-full",
    day: "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none",
    outside: "text-muted-foreground opacity-50",
    disabled: "text-muted-foreground opacity-50",
    hidden: "invisible",
  } as const satisfies Partial<ClassNames>;

  type DayPickerRootProps = {
    className?: string;
    rootRef?: React.Ref<HTMLDivElement>;
  } & React.HTMLAttributes<HTMLDivElement>;

  const rdpComponents: Record<string, unknown> = {
    Root: (rootProps: DayPickerRootProps) => {
      const { rootRef, ...rest } = rootProps;
      return <div data-slot="calendar" ref={rootRef} {...rest} />;
    },
    Chevron: CalendarChevronInternal,
    DayButton: (dayProps: React.ComponentProps<typeof DayButtonType>) => (
      <CalendarDayButton markerDefs={props.markers} size={size} {...dayProps} />
    ),
    Weekday: WeekendAwareWeekday,
  };

  if (!showChevrons) {
    rdpComponents["Nav"] = EmptyNav;
  }

  if (captionLayout === "dropdown") {
    rdpComponents["Dropdown"] = CalendarSelectDropdown;
  }

  return (
    <DayPicker
      mode="single"
      selected={props.value}
      onSelect={props.onChange}
      showOutsideDays
      fixedWeeks={fixedWeeks}
      locale={zhTW}
      defaultMonth={props.defaultMonth}
      disabled={props.disabled}
      captionLayout={captionLayout}
      startMonth={props.startMonth}
      endMonth={props.endMonth}
      modifiers={dpModifiers}
      className={cn(
        "bg-neutral-50/80 p-4 [--cell-radius:var(--radius-md)]",
        CELL_SIZE[size],
        FONT_SIZE[size],
        "rounded-xl border border-neutral-200/50",
        props.className
      )}
      classNames={classNames}
      components={rdpComponents}
    />
  );
};

Calendar.displayName = "Calendar";
export default Calendar;

/* ─── Internal components ─── */

interface CalendarDayButtonProps extends React.ComponentProps<
  typeof DayButtonType
> {
  markerDefs?: Record<string, MarkerDef>;
  size: CalendarSize;
}

function CalendarDayButton(props: CalendarDayButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  React.useEffect(
    function focusOnModifier() {
      if (props.modifiers.focused) ref.current?.focus();
    },
    [props.modifiers.focused]
  );

  const { day, modifiers, className, markerDefs, size, ...rest } = props;

  const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;

  const activeMarkers = markerDefs
    ? Object.entries(markerDefs).filter(([name]) => modifiers[name])
    : [];

  const activeLabel = activeMarkers.find(([, def]) => def.label != null)?.[1];
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
        "relative isolate z-10 border border-transparent flex flex-col items-center justify-center gap-1 aspect-square size-auto w-full rounded-(--cell-radius) leading-none font-normal transition-colors duration-150",
        size !== "lg" && "min-w-(--cell-size)",
        "hover:bg-brand-50 hover:border-accent/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1",
        "data-[selected-single=true]:bg-brand-400 data-[selected-single=true]:border-brand-600/50 data-[selected-single=true]:text-white",
        "hover:data-[selected-single=true]:bg-brand-500",
        size === "lg" && "justify-start pt-2",
        ...markerStyles,
        isWeekend && !modifiers.selected && "text-critical",
        className
      )}
      {...rest}
    >
      {rest.children}
      {activeLabel?.label != null && (
        <span
          className={cn(
            "hidden md:inline-block leading-none",
            LABEL_SIZE[size]
          )}
        >
          {activeLabel.label}
        </span>
      )}
    </button>
  );
}

CalendarDayButton.displayName = "CalendarDayButton";

interface CalendarSelectDropdownProps {
  options?: DropdownOption[];
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  "aria-label"?: string;
}

function CalendarSelectDropdown(
  props: CalendarSelectDropdownProps
): React.JSX.Element {
  const [listOpen, setListOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = props.options?.find(
    (o) => o.value.toString() === props.value?.toString()
  )?.label;

  function onOptionPick(optionValue: number) {
    props.onChange?.({
      target: { value: optionValue.toString() },
    } as React.ChangeEvent<HTMLSelectElement>);
    setListOpen(false);
  }

  useOutsideClick(containerRef, () => setListOpen(false), listOpen);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={props["aria-label"]}
        onClick={() => setListOpen((prev) => !prev)}
        className={cn(
          "flex h-7 items-center gap-1 rounded-md bg-white px-2 text-sm transition-colors",
          "hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200/70"
        )}
      >
        <span>{selectedLabel ?? props.value}</span>
        <IconChevronDown className="size-3 text-secondary/50" />
      </button>
      {listOpen && (
        <div className="absolute top-full left-0 z-200 mt-1 max-h-52 min-w-20 overflow-y-auto rounded-lg bg-white p-1 shadow-lg ring-1 ring-primary/10">
          {props.options?.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={option.disabled}
              onClick={() => onOptionPick(option.value)}
              className={cn(
                "flex w-full items-center rounded-md px-2 py-1 text-left text-sm select-none",
                "hover:bg-brand-50 focus:bg-brand-50 focus:outline-none",
                "disabled:opacity-50 disabled:pointer-events-none",
                option.value.toString() === props.value?.toString() &&
                  "bg-brand-50 font-medium text-brand-600"
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

CalendarSelectDropdown.displayName = "CalendarSelectDropdown";

function WeekendAwareWeekday(
  weekdayProps: React.ThHTMLAttributes<HTMLTableCellElement>
) {
  const label =
    typeof weekdayProps.children === "string" ? weekdayProps.children : "";
  const isWeekend = label === "日" || label === "六";
  return (
    <th
      {...weekdayProps}
      className={cn(weekdayProps.className, isWeekend && "text-critical")}
    />
  );
}
