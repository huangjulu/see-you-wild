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
        control?.onComplete?.call(undefined);
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
        userOnComplete?.call(undefined);
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
