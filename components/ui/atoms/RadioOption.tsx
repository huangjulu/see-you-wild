import { cn } from "@/lib/utils";

interface RadioOptionProps extends React.ComponentProps<"input"> {
  label: string;
}

const RadioOption: React.FC<RadioOptionProps> = (props) => {
  return (
    <label
      className={cn(
        "inline-flex items-center rounded-lg bg-white border border-stroke-default px-6 py-4 text-md typo-ui transition-all",
        "hover:border-accent/50",
        "has-checked:border-accent has-checked:bg-brand-50 has-checked:text-primary",
        "has-disabled:cursor-not-allowed has-disabled:opacity-50",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-stroke-focus",
        props.className
      )}
    >
      <input
        ref={props.ref}
        type="radio"
        className="sr-only"
        name={props.name}
        value={props.value}
        checked={props.checked}
        defaultChecked={props.defaultChecked}
        onChange={props.onChange}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
        disabled={props.disabled}
        required={props.required}
      />
      {props.label}
    </label>
  );
};

RadioOption.displayName = "RadioOption";
export default RadioOption;
