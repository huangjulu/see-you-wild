"use client";

import { type RefObject, useContext } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ReducedMotionContext } from "@/stores/motion";

interface UseTweenConfig {
  /** 起始狀態（gsap.fromTo 的第一組參數） */
  from?: gsap.TweenVars;
  /** 結束狀態；ScrollTrigger config 塞在這裡面 */
  to?: gsap.TweenVars;
  /** CSS 選擇器，在 scope 內找所有符合的元素；沒給就對 scope 自己做動畫 */
  selector?: string;
}

/**
 * 宣告式 tween 動畫，自動處理 reduced motion。
 *
 * @param scope    動畫作用的 DOM ref（同時當 useGSAP 的 scope）
 * @param animate  from / to / selector
 */
function useTween(
  scope: RefObject<HTMLElement | null>,
  animate?: UseTweenConfig
): void {
  const reduceMotion = useContext(ReducedMotionContext);

  useGSAP(
    function tween() {
      if (!scope.current) return;
      // reduced motion：跳過動畫，元素直接以最終狀態呈現
      if (reduceMotion) return;

      const elements = animate?.selector
        ? gsap.utils.toArray<HTMLElement>(animate.selector, scope.current)
        : [scope.current];

      const to = animate?.to ?? {};

      // 有 selector（多元素）且設了 stagger → 整包丟給 GSAP 處理交錯
      // 否則逐一呼叫，讓每個元素各自觸發 ScrollTrigger
      const shouldBatch = animate?.selector && to.stagger != null;

      if (shouldBatch) {
        if (animate?.from) {
          gsap.fromTo(elements, animate.from, to);
        } else {
          gsap.to(elements, to);
        }
      } else {
        elements.forEach((el) => {
          if (animate?.from) {
            gsap.fromTo(el, animate.from, to);
          } else if (animate?.to) {
            gsap.to(el, to);
          }
        });
      }
    },
    { scope }
  );
}

export { useTween, type UseTweenConfig };
