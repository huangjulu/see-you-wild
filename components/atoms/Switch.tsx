import { cn } from "@/lib/utils";
import { forwardRef } from "react";

/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  function Switch(props, forwardedRef) {
    const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
      props.onChange?.(event);
      if (event.defaultPrevented) {
        return;
      }
      const labelEl = event.currentTarget.parentElement as HTMLLabelElement;
      labelEl.ariaChecked = String(event.currentTarget.checked);
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
          "inline-grid h-[1.375rem] w-11 rounded-full p-0.5 transition-[background,box-shadow] *:pointer-events-none",
          "bg-gray-600 ring-gray-600/20",
          "focus:ring-2 focus-visible:outline-none",
          "has-[:disabled]:cursor-not-allowed",
          "has-[:checked:disabled]:bg-primary-50 has-[:checked]:bg-primary-300 has-[:checked]:ring-primary-100/50",
          "has-[:disabled]:bg-gray-400 has-[:disabled]:focus:ring-0",
          props.className
        )}
      >
        <input
          ref={forwardedRef}
          type="checkbox"
          hidden
          {...props}
          onChange={onChange}
          className="peer"
        />
        <div
          style={{ boxShadow: "0 .125rem .25rem 0 rgba(0,35,11,.2)" }}
          className="ml-0 size-[1.125rem] rounded-full bg-white transition-transform peer-checked:translate-x-[1.375rem]"
        />
      </label>
    );
  }
);

export default Switch;
