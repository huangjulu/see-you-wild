"use client";

import { type RefObject, useContext } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ReducedMotionContext } from "@/stores/motion";

interface ScrollRevealConfig {
  /** 起始狀態（gsap.fromTo 的第一組參數） */
  from?: gsap.TweenVars;
  /** 結束狀態；ScrollTrigger config 塞在這裡面 */
  to?: gsap.TweenVars;
  /** CSS 選擇器，在 target 內找所有符合的元素；沒給就對 target 自己做動畫 */
  selector?: string;
}

/**
 * 宣告式 scroll 進場動畫，自動處理 reduced motion。
 *
 * @param target  動畫作用的 DOM ref（同時當 useGSAP 的 scope）
 * @param reveal  from / to / selector
 */
function useScrollReveal(
  target: RefObject<HTMLElement | null>,
  reveal?: ScrollRevealConfig
): void {
  const reduceMotion = useContext(ReducedMotionContext);

  useGSAP(
    function scrollReveal() {
      if (!target.current) return;
      // reduced motion：跳過動畫，元素直接以最終狀態呈現
      if (reduceMotion) return;

      const elements = reveal?.selector
        ? gsap.utils.toArray<HTMLElement>(reveal.selector, target.current)
        : [target.current];

      const to = reveal?.to ?? {};

      // 有 selector（多元素）且設了 stagger → 整包丟給 GSAP 處理交錯
      // 否則逐一呼叫，讓每個元素各自觸發 ScrollTrigger
      const shouldBatch = reveal?.selector && to.stagger != null;

      if (shouldBatch) {
        if (reveal?.from) {
          gsap.fromTo(elements, reveal.from, to);
        } else {
          gsap.to(elements, to);
        }
      } else {
        elements.forEach((el) => {
          if (reveal?.from) {
            gsap.fromTo(el, reveal.from, to);
          } else if (reveal?.to) {
            gsap.to(el, to);
          }
        });
      }
    },
    { scope: target }
  );
}

export { useScrollReveal };
