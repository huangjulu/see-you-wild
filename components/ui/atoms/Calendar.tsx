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
  type MonthCaptionProps,
  type NavProps,
} from "react-day-picker";
import { zhTW } from "react-day-picker/locale";

import type { SlottableComponent } from "@/components/ui/atoms/slot.types";
import { cn } from "@/lib/utils";

/* ─── 1. Shared Types ─── */

type CalendarSlot = "chevrons" | "caption" | "grid" | "navi";

type CalendarSize = "sm" | "md" | "lg";

type GridType = "month" | "week" | "biweek";

type CaptionLayout = "label" | "dropdown";

interface MarkerDef {
  match: Matcher;
  label?: string;
  style?: string;
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

/* ─── 2. Sub-components (small → large) ─── */

interface CalendarChevronsProps {
  className?: string;
  children?: React.ReactNode;
}

const CalendarChevrons: SlottableComponent<CalendarChevronsProps> =
  Object.assign((_props: CalendarChevronsProps) => null, {
    slotName: "chevrons" as const,
    displayName: "CalendarChevrons",
  });

interface CalendarCaptionProps {
  layout?: CaptionLayout;
  className?: string;
  children?: React.ReactNode;
}

const CalendarCaption: SlottableComponent<CalendarCaptionProps> = Object.assign(
  (_props: CalendarCaptionProps) => null,
  { slotName: "caption" as const, displayName: "CalendarCaption" }
);

interface CalendarGridProps {
  type?: GridType;
  expandLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

const CalendarGrid: SlottableComponent<CalendarGridProps> = Object.assign(
  (_props: CalendarGridProps) => null,
  { slotName: "grid" as const, displayName: "CalendarGrid" }
);

interface CalendarNaviProps {
  className?: string;
  children?: React.ReactNode;
}

const CalendarNavi: SlottableComponent<CalendarNaviProps> = Object.assign(
  (_props: CalendarNaviProps) => null,
  { slotName: "navi" as const, displayName: "CalendarNavi" }
);

/* ─── 3. Internal components (not exposed as slots) ─── */

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
        "hover:bg-brand-50 hover:border-brand-100 ",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1",
        "data-[selected-single=true]:bg-brand-50 data-[selected-single=true]:border-brand-300 data-[selected-single=true]:ring data-[selected-single=true]:ring-brand-200",
        "hover:data-[selected-single=true]:bg-brand-100 hover:data-[selected-single=true]:text-brand-500",
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

  function handlePick(optionValue: number) {
    props.onChange?.({
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
        aria-label={props["aria-label"]}
        onClick={() => setListOpen((prev) => !prev)}
        className={cn(
          "flex h-7 items-center gap-1 rounded-md border border-stroke-default bg-white px-2 text-sm transition-colors",
          "hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200/70"
        )}
      >
        <span>{selectedLabel ?? props.value}</span>
        <IconChevronDown className="size-3 text-secondary" />
      </button>
      {listOpen && (
        <div className="absolute top-full left-0 z-200 mt-1 max-h-52 min-w-20 overflow-y-auto rounded-lg bg-white p-1 shadow-lg ring-1 ring-primary/10">
          {props.options?.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={option.disabled}
              onClick={() => handlePick(option.value)}
              className={cn(
                "flex w-full items-center rounded-md px-2 py-1 text-left text-sm select-none",
                "hover:bg-brand-50 focus:bg-brand-50 focus:outline-none",
                "disabled:opacity-50 disabled:pointer-events-none",
                option.value.toString() === props.value?.toString() &&
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

CalendarSelectDropdown.displayName = "CalendarSelectDropdown";

/* ─── 4. Slot config resolution ─── */

// React element props are opaque — bridge cast to read declarative slot config
function slotProp(el: React.ReactElement, key: string): string | undefined {
  const val: unknown = (el.props as Record<string, unknown>)[key];
  return typeof val === "string" ? val : undefined;
}

function getSlotName(child: React.ReactElement): CalendarSlot | undefined {
  return (child.type as { slotName?: CalendarSlot }).slotName;
}

interface ResolvedCalendarConfig {
  hasChevrons: boolean;
  captionLayout: CaptionLayout;
  gridType: GridType;
  expandLabel: string | undefined;
  chevronsClassName?: string;
  captionClassName?: string;
  gridClassName?: string;
  naviClassName?: string;
}

function resolveCalendarConfig(
  children: React.ReactNode
): ResolvedCalendarConfig {
  const slots: Partial<Record<CalendarSlot, React.ReactElement>> = {};
  let hasChildren = false;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    hasChildren = true;
    const name = getSlotName(child);
    if (name != null) slots[name] = child;
  });

  let hasChevrons = true;
  let captionLayout: CaptionLayout = "label";
  let chevronsClassName: string | undefined;
  let captionClassName: string | undefined;
  let naviClassName: string | undefined;

  const naviEl = slots["navi"];
  if (naviEl != null) {
    naviClassName = slotProp(naviEl, "className");
    // React element props are opaque — bridge cast to read navi children
    const naviChildren = (naviEl.props as Record<string, unknown>)[
      "children"
    ] as React.ReactNode;
    let innerChevrons: React.ReactElement | undefined;
    let innerCaption: React.ReactElement | undefined;
    React.Children.forEach(naviChildren, (child) => {
      if (!React.isValidElement(child)) return;
      const name = getSlotName(child);
      if (name === "chevrons") innerChevrons = child;
      else if (name === "caption") innerCaption = child;
    });
    hasChevrons = innerChevrons != null;
    if (innerChevrons != null) {
      chevronsClassName = slotProp(innerChevrons, "className");
    }
    if (innerCaption != null) {
      captionLayout =
        (slotProp(innerCaption, "layout") as CaptionLayout | undefined) ??
        "label";
      captionClassName = slotProp(innerCaption, "className");
    }
  } else {
    hasChevrons = slots["chevrons"] != null || !hasChildren;
    if (slots["chevrons"] != null) {
      chevronsClassName = slotProp(slots["chevrons"], "className");
    }
    if (slots["caption"] != null) {
      captionLayout =
        (slotProp(slots["caption"], "layout") as CaptionLayout | undefined) ??
        "label";
      captionClassName = slotProp(slots["caption"], "className");
    }
  }

  let gridType: GridType = "month";
  let expandLabel: string | undefined;
  let gridClassName: string | undefined;
  const gridEl = slots["grid"];
  if (gridEl != null) {
    gridType = (slotProp(gridEl, "type") as GridType | undefined) ?? "month";
    expandLabel = slotProp(gridEl, "expandLabel");
    gridClassName = slotProp(gridEl, "className");
  }

  return {
    hasChevrons,
    captionLayout,
    gridType,
    expandLabel,
    chevronsClassName,
    captionClassName,
    gridClassName,
    naviClassName,
  };
}

/* ─── 5. Main Component ─── */

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
  children?: React.ReactNode;
}

const _Calendar: React.FC<CalendarProps> = (props) => {
  const size = props.size ?? "md";
  const config = resolveCalendarConfig(props.children);

  const hasCompactView =
    config.gridType === "week" || config.gridType === "biweek";
  const [expanded, setExpanded] = useState(!hasCompactView);

  const visibleWeeks =
    config.gridType === "week"
      ? 1
      : config.gridType === "biweek"
        ? 2
        : undefined;

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

  // Map captionLayout to rdp captionLayout
  const rdpCaptionLayout: "label" | "dropdown" =
    config.captionLayout === "dropdown" ? "dropdown" : "label";

  // Build rdp components
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

  // When no chevrons slot, render empty nav (no buttons)
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

  function CompactWeek(
    weekProps: React.HTMLAttributes<HTMLTableRowElement> & {
      week: { weekNumber: number; days: { date: Date }[] };
    }
  ) {
    const { week, ...trProps } = weekProps;

    if (!expanded && visibleWeeks != null) {
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
      const hidden = diffWeeks < 0 || diffWeeks >= visibleWeeks;

      return (
        <tr {...trProps} style={hidden ? { display: "none" } : undefined} />
      );
    }

    return <tr {...trProps} />;
  }

  function CaptionWithToggle(
    captionProps: MonthCaptionProps
  ): React.ReactElement {
    const { calendarMonth: _c, displayIndex: _d, ...divProps } = captionProps;
    return (
      <>
        <div {...divProps} />
        {hasCompactView && !expanded && config.expandLabel != null && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className={cn(
              "w-full rounded-lg bg-brand-50 py-2 text-center typo-ui text-sm text-accent transition-all flex gap-2 items-center justify-center border border-brand-200",
              "hover:bg-brand-100 hover:text-brand-500"
            )}
          >
            {config.expandLabel}
          </button>
        )}
      </>
    );
  }

  const classNames = {
    root: "w-fit",
    months: "relative flex flex-col",
    month: cn("flex w-full flex-col gap-4", config.gridClassName),
    nav: cn(
      "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-2",
      config.naviClassName
    ),
    button_previous: cn(
      "flex items-center justify-center size-(--cell-size) rounded-(--cell-radius) p-0",
      "border border-transparent text-primary hover:bg-brand-50 transition-colors",
      "aria-disabled:opacity-50",
      config.chevronsClassName
    ),
    button_next: cn(
      "flex items-center justify-center size-(--cell-size) rounded-(--cell-radius) p-0",
      "border border-transparent text-primary hover:bg-brand-50 transition-colors",
      "aria-disabled:opacity-50",
      config.chevronsClassName
    ),
    month_caption: cn(
      "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
      config.captionClassName
    ),
    dropdowns: "flex flex-row gap-1",
    caption_label: "typo-ui text-sm font-medium select-none",
    weekdays: "flex",
    weekday:
      "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
    week: "mt-2 flex w-full",
    day: "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none",
    outside: "text-muted-foreground opacity-50",
    disabled: "text-muted-foreground opacity-50",
    hidden: "invisible",
  } as const satisfies Partial<ClassNames>;

  // Build rdp components map
  const rdpComponents: Record<string, unknown> = {
    Root: (rootProps: DayPickerRootProps) => {
      const { rootRef, ...rest } = rootProps;
      return <div data-slot="calendar" ref={rootRef} {...rest} />;
    },
    Chevron: CalendarChevronInternal,
    DayButton: (dayProps: React.ComponentProps<typeof DayButtonType>) => (
      <CalendarDayButton markerDefs={props.markers} size={size} {...dayProps} />
    ),
    Week: CompactWeek,
    MonthCaption: CaptionWithToggle,
  };

  // Add Nav override when no chevrons
  if (!config.hasChevrons) {
    rdpComponents["Nav"] = EmptyNav;
  }

  // Add Dropdown override when caption layout is dropdown
  if (config.captionLayout === "dropdown") {
    rdpComponents["Dropdown"] = CalendarSelectDropdown;
  }

  return (
    <DayPicker
      mode="single"
      selected={props.value}
      onSelect={props.onChange}
      showOutsideDays
      fixedWeeks={config.gridType === "month"}
      locale={zhTW}
      defaultMonth={props.defaultMonth}
      disabled={props.disabled}
      captionLayout={rdpCaptionLayout}
      startMonth={props.startMonth}
      endMonth={props.endMonth}
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
      components={rdpComponents}
    />
  );
};

/* ─── 6. Object.assign assembly ─── */

const Calendar = Object.assign(_Calendar, {
  Navi: CalendarNavi,
  Chevrons: CalendarChevrons,
  Caption: CalendarCaption,
  Grid: CalendarGrid,
});

/* ─── 7. displayName + export default ─── */

_Calendar.displayName = "Calendar";
export default Calendar;

/* ─── 8. Helper functions ─── */

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

type DayPickerRootProps = {
  className?: string;
  rootRef?: React.Ref<HTMLDivElement>;
} & React.HTMLAttributes<HTMLDivElement>;
