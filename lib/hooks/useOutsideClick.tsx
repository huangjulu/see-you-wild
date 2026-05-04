import { useEffect } from "react";

// dismiss-on-outside + Esc。
//
// 目前用於：CalendarSelectDropdown（atom，不能 import molecules/Popover）。
// 未來複用：atoms 層自製浮層、無法套用 components/ui/popover 的場景。
// 不要套用：能用 Popover 就用 Popover；只要 Esc 請另抽 useEscapeKey。

// pointerdown 而非 click，避免拖選誤觸
export function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void,
  enabled: boolean = true
): void {
  useEffect(
    function registerOutsideClickListeners() {
      if (!enabled) return;

      function onPointerDown(e: PointerEvent) {
        if (!(e.target instanceof Node)) return;
        if (ref.current === null) return;
        if (ref.current.contains(e.target)) return;
        callback();
      }

      function onKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") callback();
      }

      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("keydown", onKeyDown);

      return function cleanup() {
        document.removeEventListener("pointerdown", onPointerDown);
        document.removeEventListener("keydown", onKeyDown);
      };
    },
    [ref, callback, enabled]
  );
}
