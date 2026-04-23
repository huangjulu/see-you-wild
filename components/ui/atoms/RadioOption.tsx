import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface RadioOptionProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const RadioOption = forwardRef<HTMLInputElement, RadioOptionProps>(
  function RadioOption(props, forwardedRef) {
    const { label, className, ...inputProps } = props;

    return (
      <label
        className={cn(
          "inline-flex cursor-pointer items-center rounded-lg border border-border px-6 py-4 text-md typo-ui transition-all",
          "hover:border-accent/50",
          "has-checked:border-accent has-checked:bg-primary-50 has-checked:text-foreground",
          "has-disabled:cursor-not-allowed has-disabled:opacity-50",
          className
        )}
      >
        <input ref={forwardedRef} type="radio" hidden {...inputProps} />
        {label}
      </label>
    );
  }
);

RadioOption.displayName = "RadioOption";
export default RadioOption;
