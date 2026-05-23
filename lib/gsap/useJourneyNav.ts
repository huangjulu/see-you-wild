"use client";

import { useGSAP } from "@gsap/react";
import { type RefObject, useCallback, useContext, useState } from "react";

import { ReducedMotionContext } from "@/stores/motion";

import { ScrollTrigger } from ".";

interface JourneyNavState {
  isVisible: boolean;
  atEnd: boolean;
  scrollToStart: () => void;
  scrollToEnd: () => void;
}

function useJourneyNav(scope: RefObject<HTMLElement | null>): JourneyNavState {
  const [isVisible, setIsVisible] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const reduceMotion = useContext(ReducedMotionContext);

  const triggerRef = { current: null as ScrollTrigger | null };

  const scrollToStart = useCallback(() => {
    const st = triggerRef.current;
    if (!st) return;
    window.scrollTo({ top: st.start, behavior: "smooth" });
  }, []);

  const scrollToEnd = useCallback(() => {
    const st = triggerRef.current;
    if (!st) return;
    window.scrollTo({ top: st.end, behavior: "smooth" });
  }, []);

  useGSAP(
    function observeJourneyScroll() {
      if (!scope.current || reduceMotion) return;

      const st = ScrollTrigger.create({
        trigger: scope.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          setAtEnd(self.progress > 0.95);
        },
        onEnter: () => setIsVisible(true),
        onLeave: () => setIsVisible(false),
        onEnterBack: () => setIsVisible(true),
        onLeaveBack: () => setIsVisible(false),
      });

      triggerRef.current = st;

      return () => {
        st.kill();
      };
    },
    { scope }
  );

  return { isVisible, atEnd, scrollToStart, scrollToEnd };
}

export { useJourneyNav };
