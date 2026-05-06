"use client";

import { useRef } from "react";

import { useTween } from "@/lib/gsap";

const LargeBrandText: React.FC = () => {
  const textRef = useRef<HTMLHeadingElement>(null);

  useTween(textRef, {
    from: { y: 100, opacity: 0 },
    to: {
      y: 0,
      opacity: 0.1,
      duration: 2,
      ease: "power3.out",
      scrollTrigger: {
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1,
      },
    },
  });

  return (
    <h1
      ref={textRef}
      className="absolute bottom-[-10%] tracking-tighter inset-x-0 mx-auto w-max font-playfair text-[18vw] text-background whitespace-nowrap pointer-events-none opacity-0 leading-none"
    >
      See You Wild
    </h1>
  );
};

LargeBrandText.displayName = "LargeBrandText";
export default LargeBrandText;
