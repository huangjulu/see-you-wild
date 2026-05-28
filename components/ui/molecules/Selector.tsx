"use client";

import {
  ChevronDown as IconChevronDown,
  ChevronUp as IconChevronUp,
} from "lucide-react";
import { useCallback, useState } from "react";

import Drawer from "@/components/ui/atoms/Drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { maxWidth } from "@/lib/breakpoints";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

interface SelectorOption {
  value: string;
  label: string;
}

interface SelectorProps {
  options: SelectorOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
  headerAction?: React.ReactNode;
}

const Selector = (props: SelectorProps) => {
  const [open, setOpen] = useState(false);
  const isSmallScreen = useMediaQuery(maxWidth("md"));
  const Icon = open ? IconChevronUp : IconChevronDown;

  const selectedOption = props.options.find((o) => o.value === props.value);

  function onOptionSelect(value: string) {
    props.onChange(value);
    setOpen(false);
    props.onBlur?.();
  }

  const triggerClassName = cn(
    "flex w-full h-10 items-center justify-between rounded-md border px-4 text-left typo-body transition-colors",
    "border-stroke-default bg-white text-primary ring-stroke-focus",
    "hover:border-brand-400 hover:disabled:border-stroke-default",
    "focus:border-accent focus:ring-2 focus:ring-brand-200/70 focus-visible:outline-none",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    props.error != null &&
      "border-stroke-critical ring-stroke-critical/20 focus:border-stroke-critical",
    selectedOption == null && "text-neutral-200"
  );

  const selectedRef = useCallback((node: HTMLButtonElement | null) => {
    if (node == null) return;
    requestAnimationFrame(() => {
      const container = node.closest("[data-selector-list]");
      if (!(container instanceof HTMLElement)) return;
      const offsetTop = node.offsetTop - container.offsetTop;
      container.scrollTop =
        offsetTop - container.clientHeight / 2 + node.clientHeight / 2;
    });
    return () => {};
  }, []);

  const optionList = props.options.map((option) => (
    <button
      key={option.value}
      ref={option.value === props.value ? selectedRef : undefined}
      type="button"
      className={cn(
        "w-full rounded-sm px-3 py-2 text-left typo-body text-sm transition-colors",
        "hover:bg-brand-50",
        option.value === props.value && "text-brand-600"
      )}
      onClick={() => onOptionSelect(option.value)}
    >
      {option.label}
    </button>
  ));

  return (
    <div className={props.className}>
      {props.label != null && (
        <span className="typo-ui text-sm text-primary">{props.label}</span>
      )}
      {isSmallScreen ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <Drawer.Trigger
            disabled={props.disabled}
            className={triggerClassName}
          >
            <span className="truncate">
              {selectedOption ? selectedOption.label : props.placeholder}
            </span>
            <Icon className="size-4 text-secondary shrink-0" />
          </Drawer.Trigger>
          <Drawer.Content>
            <div
              data-selector-list
              className="max-h-[60vh] overflow-y-auto px-4 pb-6 pt-2"
            >
              {props.headerAction != null && (
                <div className="sticky top-0 z-[1] bg-white border-b border-stroke-default pb-1 mb-1">
                  {props.headerAction}
                </div>
              )}
              {optionList}
            </div>
          </Drawer.Content>
        </Drawer>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            disabled={props.disabled}
            className={triggerClassName}
          >
            <span className="truncate">
              {selectedOption ? selectedOption.label : props.placeholder}
            </span>
            <Icon className="size-4 text-secondary shrink-0" />
          </PopoverTrigger>
          <PopoverContent
            data-selector-list
            className="w-(--anchor-width) rounded-md border border-stroke-default p-1 ring-0 bg-white max-h-[12rem] overflow-auto"
          >
            {props.headerAction != null && (
              <div className="sticky top-0 z-[1] bg-white border-b border-stroke-default pb-1 mb-1">
                {props.headerAction}
              </div>
            )}
            {optionList}
          </PopoverContent>
        </Popover>
      )}
      {props.error != null && (
        <p className="typo-ui text-xs text-critical">{props.error}</p>
      )}
    </div>
  );
};

Selector.displayName = "Selector";
export default Selector;
