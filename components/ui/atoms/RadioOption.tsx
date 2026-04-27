import { cn } from "@/lib/utils";

interface RadioOptionProps extends React.ComponentProps<"input"> {
  label: string;
}

const RadioOption: React.FC<RadioOptionProps> = (props) => {
  return (
    <label
      className={cn(
        "inline-flex items-center rounded-lg border border-border px-6 py-4 text-md typo-ui transition-all",
        "hover:border-accent/50",
        "has-checked:border-accent has-checked:bg-primary-50 has-checked:text-foreground",
        "has-disabled:cursor-not-allowed has-disabled:opacity-50",
        props.className
      )}
    >
      <input
        ref={props.ref}
        type="radio"
        hidden
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
