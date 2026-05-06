"use client";

import {
  ChevronDown as IconChevronDown,
  ChevronUp as IconChevronUp,
} from "lucide-react";
import React, { useState } from "react";

import Drawer from "@/components/ui/atoms/Drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

interface SelectorOption {
  value: string;
  label: string;
}

interface SelectorProps {
  className?: string;
  options: SelectorOption[];
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
}

const Selector: React.FC<SelectorProps> = (props) => {
  const [open, setOpen] = useState(false);
  const isTouchDevice = useMediaQuery("(pointer: coarse)");
  const Icon = open ? IconChevronUp : IconChevronDown;

  const selectedOption = props.options.find((o) => o.value === props.value);

  function onOptionSelect(value: string) {
    props.onChange?.(value);
    setOpen(false);
    props.onBlur?.();
  }

  const triggerClassName = cn(
    "flex w-full h-10 items-center justify-between rounded-md border px-4 text-left typo-body transition-colors",
    "border-stroke-default bg-white text-primary ring-stroke-focus",
    "hover:border-stroke-strong hover:disabled:border-stroke-default",
    "focus:border-accent focus:ring-2 focus:ring-brand-200/70 focus-visible:outline-none",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    props.error != null && "border-error ring-error/20 focus:border-error",
    selectedOption == null && "text-neutral-200"
  );

  const optionList = props.options.map((option) => (
    <button
      key={option.value}
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
      {isTouchDevice ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <Drawer.Trigger
            disabled={props.disabled}
            className={triggerClassName}
          >
            <span>
              {selectedOption ? selectedOption.label : props.placeholder}
            </span>
            <Icon className="size-4 text-secondary" />
          </Drawer.Trigger>
          <Drawer.Content>
            <div className="max-h-[60vh] overflow-y-auto px-4 pb-6 pt-2">
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
            <span>
              {selectedOption ? selectedOption.label : props.placeholder}
            </span>
            <Icon className="size-4 text-secondary" />
          </PopoverTrigger>
          <PopoverContent className="w-(--anchor-width) rounded-md border border-neutral-200 p-1 ring-0 bg-white h-[9.6rem] overflow-auto">
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
