import { cn } from "@/lib/utils";

type RadioOptionVariant = "filled" | "outlined";

interface RadioOptionProps extends React.ComponentProps<"input"> {
  label: string;
  subtitle?: string;
  variant?: RadioOptionVariant;
}

const VARIANT_CLASSES: Record<RadioOptionVariant, string> = {
  filled: cn(
    "hover:border-accent/50 hover:bg-brand-50",
    "has-checked:border-brand-500 has-checked:bg-brand-400 has-checked:text-white hover:has-checked:bg-brand-500"
  ),
  outlined: cn(
    "hover:border-brand-300 hover:bg-brand-50",
    "has-checked:border-brand-400 has-checked:bg-brand-50 has-checked:text-brand-600 hover:has-checked:bg-brand-100"
  ),
};

const RadioOption = (props: RadioOptionProps) => {
  const {
    className,
    label,
    subtitle,
    variant = "filled",
    ...restProps
  } = props;
  return (
    <label
      className={cn(
        "inline-flex items-center rounded-full bg-white border border-stroke-default px-4 py-2 typo-ui text-sm transition-all",
        "md:rounded-lg md:px-5 md:py-3 md:text-base",
        VARIANT_CLASSES[variant],
        "has-disabled:cursor-not-allowed has-disabled:opacity-50",
        "has-focus-visible:ring-2 has-focus-visible:ring-stroke-focus",
        props.className
      )}
    >
      <input type="radio" className="sr-only" {...restProps} />
      {label}
      {subtitle != null && (
        <span className="ml-1 text-xs opacity-70">{subtitle}</span>
      )}
    </label>
  );
};

RadioOption.displayName = "RadioOption";
export default RadioOption;
