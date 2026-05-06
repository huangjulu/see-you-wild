import { Children, cloneElement, isValidElement } from "react";

import Slot from "@/components/ui/atoms/Slot";

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

/**
 * 掃描 React children，依據子元件的 slot 歸屬分類到各 slot。
 *
 * Slot 歸屬的識別委派給 isSlot/getSlot：
 * - element 的 type 是 Slot
 * - 或 element 的 type 上掛了 slotName static
 * - 或 element 的 props 上有 slot / data-slot
 *
 * 未匹配的 child 歸入 "children" slot。
 *
 * @param node - React children（來自 props.children）
 * @returns Partial record，key 為 slot name，value 為 ReactElement
 *
 * @example
 * ```tsx
 * // Dialog.tsx
 * const slots = resolveSlots<DialogSlot>(props.children);
 *
 * // slots["loader"]   → single ReactElement or undefined
 * // slots["buttons"]  → Fragment wrapping matched children, or undefined
 * // slots["children"] → Fragment wrapping unmatched children, or undefined
 * ```
 */
export function resolveSlots<T extends string>(
  node: React.ReactNode
): Partial<Record<T | "children", React.ReactElement>> {
  const collected: Record<string, React.ReactNode[]> = { children: [] };

  Children.forEach(node, (child, index) => {
    if (!isValidElement(child)) {
      collected["children"].push(child);
      return;
    }

    if (isSlot(child)) {
      const slot = getSlot(child);
      if (slot != null) {
        if (collected[slot] == null) {
          collected[slot] = [];
        }
        collected[slot].push(cloneElement(child, { key: index }));
        return;
      }
    }

    collected["children"].push(cloneElement(child, { key: index }));
  });

  // 以 Record<string, ...> 建構，最後統一收斂到 Partial<Record<T | "children", ...>>。
  // 方案 B 的 slot 歸屬是 runtime 決定的（child.type.slotName），
  // TS 無法在 compile-time 保證 slotName 字串屬於泛型 T，這裡是必要的邊界橋接。
  const slots: Record<string, React.ReactElement> = {};
  for (const [name, children] of Object.entries(collected)) {
    if (children.filter(Boolean).length > 0) {
      slots[name] = <>{children}</>;
    }
  }
  return slots as Partial<Record<T | "children", React.ReactElement>>;
}
