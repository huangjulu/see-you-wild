"use client";

import { type RefObject, useContext } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ReducedMotionContext } from "@/stores/motion";

interface TimelineOptions {
  /** mount 時鎖住 body 滾動，onComplete 或 unmount 時自動解鎖 */
  lockScroll?: boolean;
  /** 動畫結束後隱藏容器（display:none + aria-hidden） */
  hideOnDone?: boolean;
  /** 動畫結束後的 callback；reduced motion 時立刻呼叫 */
  onDone?: () => void;
}

// ---- side-effect units（各自管自己的 setup / teardown）----

/** 鎖住 body 滾動，回傳解鎖函式 */
function scrollLock() {
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = "";
  };
}

function hideElement(el: HTMLElement) {
  el.style.display = "none";
  el.setAttribute("aria-hidden", "true");
}

// ---- hook 本體 ----

/**
 * 建立一條 GSAP timeline，自動處理 reduced motion 與生命週期善後。
 *
 * @param scope   動畫容器 ref（同時限定 GSAP 選擇器查詢範圍）
 * @param build   拿到 timeline 和 DOM 元素後排動畫；回傳 function 會在 unmount 時被呼叫
 * @param options 生命週期 options（lockScroll / hideOnDone / onDone）
 */
function useTimeline(
  scope: RefObject<HTMLElement | null>,
  build: (tl: gsap.core.Timeline, el: HTMLElement) => void | (() => void),
  options?: TimelineOptions
): void {
  const reduceMotion = useContext(ReducedMotionContext);

  useGSAP(
    function timeline() {
      if (!scope.current) return;
      const el = scope.current;
      const { lockScroll, hideOnDone, onDone } = options ?? {};

      // reduced motion：跳過動畫，直接執行善後
      if (reduceMotion) {
        if (hideOnDone) hideElement(el);
        onDone?.();
        return;
      }

      const unlock = lockScroll ? scrollLock() : undefined;

      const tl = gsap.timeline({
        onComplete() {
          unlock?.();
          if (hideOnDone) hideElement(el);
          onDone?.();
        },
      });

      const cleanup = build(tl, el);

      // unmount 時解鎖 + 執行消費端的 cleanup
      return () => {
        unlock?.();
        cleanup?.();
      };
    },
    { scope }
  );
}

export { useTimeline };
