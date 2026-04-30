import { X as IconX } from "lucide-react";

import Button from "@/components/ui/atoms/Button";
import Slot from "@/components/ui/atoms/Slot";
import type { SlottableComponent } from "@/components/ui/atoms/slot.types";
import { resolveSlots } from "@/lib/slot";
import type { Override } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ─── Slot Types ─── */

type SlotProps = Override<
  React.ComponentProps<typeof Slot>,
  {
    slot: "buttons" | "children" | "close" | "loader";
  }
>;

type DialogSlot = SlotProps["slot"];

/* ─── Sub-components ─── */

interface ButtonProps extends React.ComponentPropsWithRef<typeof Button> {}

const CloseButton: SlottableComponent<ButtonProps> = Object.assign(
  (props: ButtonProps) => (
    <Slot slot="close">
      <Button
        theme="text"
        icon={<IconX className="size-4 text-primary-400" />}
        {...props}
      />
    </Slot>
  ),
  { slotName: "close", displayName: "DialogCloseButton" }
);

const DangerButton: SlottableComponent<ButtonProps> = Object.assign(
  (props: ButtonProps) => (
    <Slot slot="buttons">
      <Button theme="danger" {...props}>
        {props.children}
      </Button>
    </Slot>
  ),
  { slotName: "buttons", displayName: "DangerButton" }
);

const OutlineButton: SlottableComponent<ButtonProps> = Object.assign(
  (props: ButtonProps) => (
    <Slot slot="buttons">
      <Button theme="outline" {...props}>
        {props.children}
      </Button>
    </Slot>
  ),
  { slotName: "buttons", displayName: "OutlineButton" }
);

const PrimaryButton: SlottableComponent<ButtonProps> = Object.assign(
  (props: ButtonProps) => (
    <Slot slot="buttons">
      <Button theme="solid" {...props}>
        {props.children}
      </Button>
    </Slot>
  ),
  { slotName: "buttons", displayName: "PrimaryButton" }
);

interface LoaderProps {
  className?: string;
}

const Loader: SlottableComponent<LoaderProps> = Object.assign(
  (props: LoaderProps) => (
    <div className={cn("size-12 justify-self-center p-1.5", props.className)}>
      <svg
        width={36}
        height={36}
        viewBox="-18 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin text-primary-300"
      >
        <path
          fill="currentColor"
          d="M14 18C14 10.047 7.953 4 0 4V0c9.941 0 18 8.059 18 18z"
        />
      </svg>
    </div>
  ),
  { slotName: "loader", displayName: "DialogLoader" }
);

/* ─── Dialog ─── */

interface DialogProps {
  ref?: React.Ref<HTMLDivElement>;
  title?: React.ReactNode;
  message?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const _Dialog: React.FC<DialogProps> = (props) => {
  const slots = resolveSlots<DialogSlot>(props.children);

  return (
    <div
      ref={props.ref}
      className={cn(
        "w-full max-w-[--max-w] rounded-lg bg-background shadow-lg",
        props.className
      )}
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            {props.title != null && (
              <div className="typo-sub-heading text-xl text-foreground">
                {props.title}
              </div>
            )}
            {props.message != null && (
              <div className="typo-body text-sm leading-relaxed text-muted">
                {props.message}
              </div>
            )}
            {slots["children"]}
          </div>
          {slots["close"]}
        </div>
        {slots["loader"]}
        {slots["buttons"] && (
          <div className="flex justify-end gap-3">{slots["buttons"]}</div>
        )}
      </div>
    </div>
  );
};

const Dialog = Object.assign(_Dialog, {
  CloseButton,
  DangerButton,
  Loader,
  OutlineButton,
  PrimaryButton,
});

_Dialog.displayName = "Dialog";

export default Dialog;
