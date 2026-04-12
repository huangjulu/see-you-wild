"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useContext } from "react";
import { ReducedMotionContext } from "@/stores/motion";

const LargeBrandText: React.FC = () => {
  const textRef = useRef<HTMLHeadingElement>(null);
  const reduceMotion = useContext(ReducedMotionContext);

  useGSAP(function animateFooterText() {
    const el = textRef.current;
    if (!el || reduceMotion) return;

    const footerEl = el.closest("footer");
    if (!footerEl) return;

    gsap.fromTo(
      el,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 0.1,
        duration: 2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerEl,
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );
  });

  return (
    <h1
      ref={textRef}
      className="absolute bottom-[-5%] inset-x-0 mx-auto w-max font-playfair text-[20vw] text-background whitespace-nowrap pointer-events-none opacity-0 leading-none"
    >
      aura wild
    </h1>
  );
};

LargeBrandText.displayName = "LargeBrandText";
export default LargeBrandText;
