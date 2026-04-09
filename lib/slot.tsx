import { Children, cloneElement, isValidElement } from "react";

/**
 * 掃描 React children，依據 component → slot name 的 mapping 分類到各 slot。
 *
 * - 匹配到的 child 依 slot name 收集，相同 slot 的多個 child 合併為 Fragment
 * - 未匹配的 child 歸入 "children" slot
 * - 內部以 `child.type === component` 比對（等同原 matchSlot）
 *
 * @param node    - React children（來自 props.children）
 * @param mapping - [Component, slotName] 對應表，一個 Component 對一個 slot name
 * @returns Partial record，key 為 slot name，value 為 ReactElement
 *
 * @example
 * ```tsx
 * // Dialog.tsx
 * const slots = resolveSlots(props.children, [
 *   [Loader,        "loader"],
 *   [DangerButton,  "buttons"],
 *   [OutlineButton, "buttons"],
 *   [PrimaryButton, "buttons"],
 * ]);
 *
 * // slots["loader"]   → single ReactElement or undefined
 * // slots["buttons"]  → Fragment wrapping matched children, or undefined
 * // slots["children"] → Fragment wrapping unmatched children, or undefined
 * ```
 *
 * @example
 * ```tsx
 * // ModalCard.tsx
 * const slots = resolveSlots(props.children, [
 *   [ModalCardHeader, "header"],
 *   [ModalCardMain,   "main"],
 *   [ModalCardFooter, "footer"],
 * ]);
 * ```
 */
export function resolveSlots<T extends string>(
  node: React.ReactNode,
  mapping: [React.ElementType, T][]
): Partial<Record<T | "children", React.ReactElement>> {
  const slots: Partial<Record<T | "children", React.ReactElement>> = {};
  const groups: Record<string, React.ReactNode[]> = Object.fromEntries(
    mapping.map(([, slot]) => [slot, []])
  );
  const nodes: React.ReactNode[] = [];

  Children.forEach(node, (child, index) => {
    if (!isValidElement(child)) {
      return nodes.push(child);
    }

    const matched = mapping.find(([component]) => child.type === component);

    if (matched != null) {
      const slot = matched[1];
      groups[slot].push(cloneElement(child, { key: index }));
    } else {
      nodes.push(cloneElement(child, { key: index }));
    }
  });

  for (const [name, children] of Object.entries(groups)) {
    if (children.length > 0) {
      slots[name as T] = <>{children}</>;
    }
  }

  if (nodes.filter(Boolean).length > 0) {
    slots["children"] = <>{nodes}</>;
  }

  return slots;
}
