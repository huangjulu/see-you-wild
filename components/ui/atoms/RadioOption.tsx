import { cn } from "@/lib/utils";

interface RadioOptionProps extends React.ComponentProps<"input"> {
  label: string;
}

const RadioOption: React.FC<RadioOptionProps> = (props) => {
  const { className, label, ...restProps } = props;
  return (
    <label
      className={cn(
        "inline-flex items-center rounded-full bg-white border border-stroke-default px-4 py-2 typo-ui text-sm transition-all",
        "md:rounded-lg md:px-6 md:py-4",
        "hover:border-accent/50 hover:bg-brand-50 hover:border",
        "has-checked:border-brand-500 has-checked:bg-brand-400 has-checked:text-white hover:has-checked:bg-brand-500",
        "has-disabled:cursor-not-allowed has-disabled:opacity-50",
        "has-focus-visible:ring-2 has-focus-visible:ring-stroke-focus",
        props.className
      )}
    >
      <input type="radio" className="sr-only" {...restProps} />
      {label}
    </label>
  );
};

RadioOption.displayName = "RadioOption";
export default RadioOption;
