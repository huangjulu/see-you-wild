"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/gsap";

const LargeBrandText: React.FC = () => {
  const footerLargeTextRef = useRef<HTMLHeadingElement>(null);

  useScrollReveal(footerLargeTextRef, {
    from: { y: 100, opacity: 0 },
    to: {
      y: 0,
      opacity: 0.1,
      duration: 2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "footer",
        end: "bottom bottom",
        start: "top bottom",
        scrub: true,
        markers: true,
      },
    },
  });

  return (
    <h1
      ref={footerLargeTextRef}
      className="absolute bottom-[-5%] inset-x-0 mx-auto w-max font-playfair text-[20vw] text-background whitespace-nowrap pointer-events-none opacity-0 leading-none"
    >
      aura wild
    </h1>
  );
};

LargeBrandText.displayName = "LargeBrandText";
export default LargeBrandText;
