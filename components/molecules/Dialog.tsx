import { cn } from "@/lib/utils";
import { resolveSlots } from "@/lib/slot";
import Slot, { type SlottableComponent } from "@/components/atoms/Slot";
import type { Override } from "@/lib/types";
import Button from "@/components/atoms/Button";

/* ─── Slot Types ─── */

type SlotProps = Override<
  React.ComponentProps<typeof Slot>,
  {
    slot: "buttons" | "children" | "loader";
  }
>;

type DialogSlot = SlotProps["slot"];

/* ─── Sub-components ─── */

interface ButtonProps extends React.ComponentPropsWithRef<typeof Button> {}

const DangerButton: SlottableComponent<ButtonProps> = Object.assign(
  (props: ButtonProps) => (
    <Slot slot="buttons">
      <Button theme="solid" {...props}>
        {props.children}
      </Button>
    </Slot>
  ),
  { slotName: "buttons", displayName: "DangerButton" }
);

const OutlineButton: SlottableComponent<ButtonProps> = Object.assign(
  (props: ButtonProps) => (
    <Slot slot="buttons">
      <Button theme="ghost" {...props}>
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
  const { title, message } = props;
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
        <div>
          {title != null && (
            <div className="typo-sub-heading text-xl text-foreground">
              {title}
            </div>
          )}
          {message != null && (
            <div className="typo-body text-sm leading-relaxed text-muted">
              {message}
            </div>
          )}
          {slots["children"]}
        </div>
        {slots["loader"]}
        {slots["buttons"] && <div>{slots["buttons"]}</div>}
      </div>
    </div>
  );
};

const Dialog = Object.assign(_Dialog, {
  DangerButton,
  Loader,
  OutlineButton,
  PrimaryButton,
});

_Dialog.displayName = "Dialog";

export default Dialog;
