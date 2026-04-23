import { forwardRef, useRef } from "react";
import { updateRef } from "@/lib/react-ref";
import { cn } from "@/lib/utils";

interface TextInputProps extends React.ComponentPropsWithoutRef<"input"> {}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(props, forwardedRef) {
    const onRef = useRef((instance: HTMLInputElement | null) => {
      updateRef(forwardedRef, instance);
      if (instance == null) {
        return;
      }
      instance.addEventListener("change", touch, { once: true, passive: true });
      instance.addEventListener("invalid", touch, {
        once: true,
        passive: true,
      });
      function touch(event: Event) {
        const input = event.currentTarget;
        if (input instanceof HTMLElement) {
          input.dataset.touched = "";
          input.removeEventListener("change", touch);
          input.removeEventListener("invalid", touch);
        }
      }
    }).current;

    return (
      <input
        ref={onRef}
        type="text"
        {...props}
        className={cn(
          "min-h-8 min-w-0 rounded-md border px-3 transition-colors typo-body-2",
          "border-gray-500 bg-white text-black-87 ring-primary-400/25",
          "placeholder:text-black-25 read-only:placeholder:text-black-25 disabled:placeholder:text-black-25",
          "hover:border-primary-400 hover:disabled:border-gray-500",
          "focus:border-primary-400 focus:ring-2 focus-visible:outline-none",
          "data-[touched]:invalid:border-error data-[touched]:invalid:ring-error/25 data-[touched]:invalid:focus:border-error",
          "read-only:bg-gray-200 read-only:text-black-38",
          "disabled:bg-gray-200 disabled:text-black-38",
          props.className
        )}
      />
    );
  }
);

export default TextInput;
