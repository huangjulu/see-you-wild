import { cn } from "@/lib/utils";
import { isValidElement } from "react";

interface SlotProps {
  slot: string;
  ["data-slot"]?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * 帶有 slotName static property 的 React component。
 * 消費端用這個宣告子元件屬於哪個 slot，父元件的 resolveSlots 讀取 slotName 分類。
 */
interface SlottableComponent<P = object> extends React.FC<P> {
  slotName: string;
}

const Slot: React.FC<SlotProps> = (props) => (
  <div data-slot={props.slot} className={cn("contents", props.className)}>
    {props.children}
  </div>
);

export default Slot;
export type { SlottableComponent };

/**
 * 從 React element 的 type 讀 slotName static property。
 * 參數型別用 unknown 是為了相容 React.ReactElement["type"]（string | JSXElementConstructor），
 * 用 Reflect.get + typeof 橋接，避免 type assertion。
 */
function readSlotName(type: unknown): string | undefined {
  if (typeof type !== "function") return undefined;
  const value: unknown = Reflect.get(type, "slotName");
  return typeof value === "string" ? value : undefined;
}

export function isSlot(node: unknown): node is React.ReactElement {
  if (!isValidElement(node)) return false;
  if (node.type === Slot) return true;
  if (readSlotName(node.type) != null) return true;
  const props = node.props;
  if (typeof props !== "object" || props == null) return false;
  return "slot" in props || "data-slot" in props;
}

export function getSlot(node: React.ReactElement): string | undefined {
  const fromType = readSlotName(node.type);
  if (fromType != null) return fromType;
  const props = node.props;
  if (typeof props !== "object" || props == null) return undefined;
  if ("slot" in props && typeof props.slot === "string") return props.slot;
  if ("data-slot" in props && typeof props["data-slot"] === "string") {
    return props["data-slot"];
  }
  return undefined;
}
