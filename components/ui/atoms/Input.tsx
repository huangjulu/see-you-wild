import { useRef } from "react";
import { updateRef } from "@/lib/react-ref";
import { cn } from "@/lib/utils";

type TextInputProps = React.ComponentProps<"input">;

const TextInput: React.FC<TextInputProps> = (props) => {
  const onRef = useRef((instance: HTMLInputElement | null) => {
    updateRef(props.ref, instance);
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
        "border-neutral-400 bg-white text-black-87 ring-primary-400/25",
        "placeholder:text-black-25 read-only:placeholder:text-black-25 disabled:placeholder:text-black-25",
        "hover:border-primary-400 hover:disabled:border-neutral-400",
        "focus:border-primary-400 focus:ring-2 focus-visible:outline-none",
        "data-[touched]:invalid:border-error data-[touched]:invalid:ring-error/25 data-[touched]:invalid:focus:border-error",
        "read-only:bg-neutral-100 read-only:text-black-38",
        "disabled:bg-neutral-100 disabled:text-black-38",
        props.className
      )}
    />
  );
};

TextInput.displayName = "TextInput";
export default TextInput;
