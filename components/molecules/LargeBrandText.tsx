"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/gsap";

const LargeBrandText: React.FC = () => {
  const textRef = useRef<HTMLHeadingElement>(null);

  useScrollReveal(textRef, {
    from: { y: 100, opacity: 0 },
    to: {
      y: 0,
      opacity: 0.1,
      duration: 2,
      ease: "power3.out",
      scrollTrigger: {
        start: "top 60%",
        toggleActions: "play none none none",
      },
    },
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
