import { X as IconX } from "lucide-react";

import { cn } from "@/lib/utils";

interface FilterTagProps {
  label: string;
  onClear: () => void;
  className?: string;
}

const FilterTag = (props: FilterTagProps) => {
  return (
    <span
      className={cn(
        "typo-ui inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-surface-warm px-3 py-0.5 text-[13px] text-brand-600",
        props.className
      )}
    >
      {props.label}
      <button
        type="button"
        onClick={props.onClear}
        className="text-brand-400 transition-colors hover:text-brand-600"
      >
        <IconX className="size-3.5" />
      </button>
    </span>
  );
};

FilterTag.displayName = "FilterTag";
export default FilterTag;
