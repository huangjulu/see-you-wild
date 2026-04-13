"use client";

import { type RefObject, useContext } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ReducedMotionContext } from "@/stores/motion";

interface UseTimelineControl extends gsap.TimelineVars {
  lockScroll?: boolean;
}

function scrollLock() {
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = "";
  };
}

/**
 * 建立一條 GSAP timeline，自動處理 reduced motion 與生命週期。
 *
 * @param scope   動畫容器 ref（同時限定 GSAP 選擇器查詢範圍）
 * @param animate 拿到 timeline 和 DOM 元素後排動畫的 callback
 * @param control gsap.TimelineVars 擴展選項，包含：
 *                - lockScroll?: boolean — mount 時鎖住 body 滾動，onComplete 或 unmount 時自動解鎖
 *                - paused?: boolean — 初始暫停（需搭配 cue 使用）
 *                - onComplete?: () => void — 內部會依序執行：unlock → 使用者 onComplete → 若 !paused 則 dispatch cue
 * @param cue     CustomEvent 名稱，用於元件間溝通：無 cue 時忽略；
 *                - paused: false（default）— 動畫完成時 dispatch event
 *                - paused: true — 監聽 cue event 並自動觸發 timeline.play()
 */
function useTimeline(
  scope: RefObject<HTMLElement | null>,
  animate: (tl: gsap.core.Timeline, el: HTMLElement) => void,
  control?: UseTimelineControl,
  cue?: string
): void {
  const reduceMotion = useContext(ReducedMotionContext);

  useGSAP(
    function timeline() {
      if (!scope.current) return;
      const el = scope.current;

      if (reduceMotion) {
        control?.onComplete?.();
        if (cue && !control?.paused) {
          window.dispatchEvent(new CustomEvent(cue));
        }
        return;
      }

      const cleanups: (() => void)[] = [];

      const { lockScroll, ...timelineVars } = control ?? {};
      const unlock = lockScroll ? scrollLock() : undefined;
      if (unlock) cleanups.push(unlock);

      const userOnComplete = timelineVars.onComplete;
      timelineVars.onComplete = function mergedOnComplete() {
        unlock?.();
        userOnComplete?.();
        if (cue && !control?.paused) {
          window.dispatchEvent(new CustomEvent(cue));
        }
      };

      const tl = gsap.timeline(timelineVars);

      if (cue && control?.paused) {
        const handler = () => tl.play();
        window.addEventListener(cue, handler, { once: true });
        cleanups.push(() => window.removeEventListener(cue, handler));
      }

      animate(tl, el);

      return () => {
        cleanups.forEach((fn) => fn());
      };
    },
    { scope }
  );
}

export { useTimeline };
export type { UseTimelineControl };
