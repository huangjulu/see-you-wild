import { cn } from "@/lib/utils";
import { resolveSlots } from "@/lib/slot";
import Slot, { type SlottableComponent } from "@/components/atoms/Slot";
import type { Override } from "@/lib/types";
import Button from "@/components/atoms/Button";
import { X as IconX, ArrowLeft as IconArrowLeft } from "lucide-react";

/* ─── Slot Types ─── */

type SlotProps = Override<
  React.ComponentProps<typeof Slot>,
  {
    slot:
      | "children"
      | "footer"
      | "footer-back-button"
      | "footer-cancel-button"
      | "footer-confirm-button"
      | "header"
      | "header-close-button"
      | "main";
  }
>;

type ModalCardSlot = SlotProps["slot"];

/* ─── Sub-components ─── */

interface ButtonProps extends React.ComponentPropsWithRef<typeof Button> {}

const HeaderCloseButton: SlottableComponent<ButtonProps> = Object.assign(
  (props: ButtonProps) => (
    <Slot slot="header-close-button">
      <Button
        theme="text"
        icon={<IconX className="size-4 text-primary-400" />}
        {...props}
      />
    </Slot>
  ),
  { slotName: "header-close-button", displayName: "HeaderCloseButton" }
);

const FooterBackButton: SlottableComponent<ButtonProps> = Object.assign(
  (props: ButtonProps) => (
    <Slot slot="footer-back-button">
      <Button
        theme="text"
        className="pl-0"
        icon={<IconArrowLeft className="size-4" />}
        {...props}
      >
        {props.children ?? "Back"}
      </Button>
    </Slot>
  ),
  { slotName: "footer-back-button", displayName: "FooterBackButton" }
);

const FooterCancelButton: SlottableComponent<ButtonProps> = Object.assign(
  (props: ButtonProps) => (
    <Slot slot="footer-cancel-button">
      <Button theme="outline" {...props}>
        {props.children ?? "Cancel"}
      </Button>
    </Slot>
  ),
  { slotName: "footer-cancel-button", displayName: "FooterCancelButton" }
);

const FooterConfirmButton: SlottableComponent<ButtonProps> = Object.assign(
  (props: ButtonProps) => (
    <Slot slot="footer-confirm-button">
      <Button theme="solid" {...props}>
        {props.children ?? "Confirm"}
      </Button>
    </Slot>
  ),
  { slotName: "footer-confirm-button", displayName: "FooterConfirmButton" }
);

interface ModalCardHeaderProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  alignment?: "start" | "center";
  className?: string;
  children?: React.ReactNode;
}

const ModalCardHeader: SlottableComponent<ModalCardHeaderProps> = Object.assign(
  (props: ModalCardHeaderProps) => {
    const { title, description, alignment = "start" } = props;
    const slots = resolveSlots<ModalCardSlot>(props.children);
    return (
      <Slot slot="header">
        <header
          style={{ "--min-h": "4rem" } as React.CSSProperties}
          className={cn(
            "flex min-h-[--min-h] items-center gap-4 p-4",
            props.className
          )}
        >
          {slots["children"] ?? (
            <div
              className={cn(
                "flex min-w-0 flex-1 flex-col justify-center self-stretch break-words [&>:nth-child(n+2)]:mt-auto",
                alignment === "start" ? "text-start" : "",
                alignment === "center" ? "text-center" : ""
              )}
            >
              {title != null && (
                <div className="typo-subtitle-1 text-primary-600">{title}</div>
              )}
              {description != null && (
                <div className="typo-body-2 text-black-60">{description}</div>
              )}
            </div>
          )}
          {slots["header-close-button"]}
        </header>
      </Slot>
    );
  },
  { slotName: "header", displayName: "ModalCardHeader" }
);

interface ModalCardMainProps {
  className?: string;
  children?: React.ReactNode;
}

const ModalCardMain: SlottableComponent<ModalCardMainProps> = Object.assign(
  (props: ModalCardMainProps) => (
    <Slot
      slot="main"
      className={cn(
        "[&>*]:border-y [&>*]:border-gray-400",
        "[&:first-child>*]:border-t-0 [&:last-child>*]:border-b-0"
      )}
    >
      <main className={cn("p-4", props.className)}>{props.children}</main>
    </Slot>
  ),
  { slotName: "main", displayName: "ModalCardMain" }
);

interface ModalCardFooterProps {
  className?: string;
  children?: React.ReactNode;
}

const ModalCardFooter: SlottableComponent<ModalCardFooterProps> = Object.assign(
  (props: ModalCardFooterProps) => {
    const slots = resolveSlots<ModalCardSlot>(props.children);
    return (
      <Slot slot="footer">
        <footer className={cn("flex min-w-0 p-4", props.className)}>
          {slots["children"] ?? (
            <>
              {slots["footer-back-button"]}
              <div className="flex flex-1 justify-end gap-3 empty:invisible">
                {slots["footer-cancel-button"]}
                {slots["footer-confirm-button"]}
              </div>
            </>
          )}
        </footer>
      </Slot>
    );
  },
  { slotName: "footer", displayName: "ModalCardFooter" }
);

/* ─── ModalCard ─── */

interface ModalCardProps {
  ref?: React.Ref<HTMLDivElement>;
  className?: string;
  children?: React.ReactNode;
}

const _ModalCard: React.FC<ModalCardProps> = (props) => {
  const slots = resolveSlots<ModalCardSlot>(props.children);

  return (
    <div
      ref={props.ref}
      className={cn("grid overflow-clip rounded-lg bg-white", props.className)}
    >
      {slots["header"]}
      {slots["main"]}
      {slots["footer"]}
    </div>
  );
};

const ModalCard = Object.assign(_ModalCard, {
  Header: Object.assign(ModalCardHeader, {
    CloseButton: HeaderCloseButton,
  }),
  Main: ModalCardMain,
  Footer: Object.assign(ModalCardFooter, {
    BackButton: FooterBackButton,
    CancelButton: FooterCancelButton,
    ConfirmButton: FooterConfirmButton,
  }),
});

_ModalCard.displayName = "ModalCard";

export default ModalCard;
