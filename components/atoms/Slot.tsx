import { cn } from "@/lib/utils";
import { isValidElement } from "react";

interface SlotProps {
  slot: string;
  ["data-slot"]?: string;
  className?: string;
  children?: React.ReactNode;
}

const Slot: React.FC<SlotProps> = (props) => (
  <div data-slot={props.slot} className={cn("contents", props.className)}>
    {props.children}
  </div>
);

export default Slot;

export function isSlot<TProps extends SlotProps = SlotProps>(
  node: unknown
): node is React.ReactElement<TProps> {
  return (
    isValidElement<TProps>(node) &&
    (node.type === Slot || "slot" in node.props || "data-slot" in node.props)
  );
}

export function getSlot<TProps extends SlotProps = SlotProps>(
  node: React.ReactElement<TProps>
): TProps["slot"] {
  return node.props.slot ?? node.props["data-slot"];
}
