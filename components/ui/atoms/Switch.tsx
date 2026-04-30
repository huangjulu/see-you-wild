import { cn } from "@/lib/utils";

type SwitchProps = React.ComponentProps<"input">;

const Switch: React.FC<SwitchProps> = (props) => {
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    props.onChange?.(event);
    if (event.defaultPrevented) {
      return;
    }
    const parent = event.currentTarget.parentElement;
    if (!(parent instanceof HTMLLabelElement)) return;
    parent.ariaChecked = String(event.currentTarget.checked);
  };

  return (
    <label
      role="switch"
      tabIndex={0}
      aria-checked={props.checked ?? props.defaultChecked}
      onKeyDown={(e) =>
        e.key === " " && [e.preventDefault(), e.currentTarget.click()]
      }
      className={cn(
        "inline-grid h-5.5 w-11 rounded-full p-0.5 transition-[background,box-shadow] *:pointer-events-none",
        "bg-neutral-500 ring-neutral-500/20",
        "focus:ring-2 focus-visible:outline-none",
        "has-disabled:cursor-not-allowed",
        "has-[:checked:disabled]:bg-primary-50 has-checked:bg-primary-300 has-checked:ring-primary-100/50",
        "has-disabled:bg-neutral-300 has-disabled:focus:ring-0",
        props.className
      )}
    >
      <input
        ref={props.ref}
        type="checkbox"
        hidden
        {...props}
        onChange={onChange}
        className="peer"
      />
      <div
        style={{ boxShadow: "0 .125rem .25rem 0 rgba(0,35,11,.2)" }}
        className="ml-0 size-4.5 rounded-full bg-white transition-transform peer-checked:translate-x-5.5"
      />
    </label>
  );
};

Switch.displayName = "Switch";
export default Switch;
