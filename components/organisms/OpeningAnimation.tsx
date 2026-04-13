"use client";

import React, { useRef } from "react";
import { SplitText } from "gsap/SplitText";
import { useTimeline } from "@/lib/gsap";

const OpeningAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);

  useTimeline(
    containerRef,
    (tl, el) => {
      const brand = brandRef.current;
      const videoWrap = videoWrapRef.current;
      if (!brand || !videoWrap) return;

      tl.to(brand, { duration: 0.5 });

      const split = SplitText.create(brand, {
        type: "words",
        mask: "words",
      });
      tl.set(brand, { opacity: 1 });

      tl.addLabel("reveal");

      tl.from(
        split.words,
        {
          y: "100%",
          stagger: 0.15,
          duration: 1,
          ease: "expo.out",
        },
        "reveal"
      );

      tl.fromTo(
        videoWrap,
        { opacity: 0 },
        {
          opacity: 1,
          filter: "blur(15px)",
          duration: 1,
          ease: "power3.inOut",
        },
        "reveal+=0.3"
      );

      tl.to(videoWrap, {
        scale: 0.7,
        borderRadius: "2.5rem",
        filter: "blur(0px)",
        duration: 1,
        ease: "power3.inOut",
      });

      tl.to(videoWrap, {
        scale: 1,
        borderRadius: "0rem",
        duration: 1,
        ease: "power3.inOut",
      });

      tl.to(el, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });
    },
    {
      lockScroll: true,
      hideOnDone: true,
      onDone: () => {
        window.dispatchEvent(new CustomEvent("opening-animation-complete"));
      },
    }
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-deep"
    >
      <div ref={brandRef} className="absolute z-10 text-center opacity-0">
        <p className="typo-display text-4xl md:text-6xl lg:text-7xl text-white">
          See You Wild
        </p>
      </div>
      <div
        ref={videoWrapRef}
        className="relative overflow-hidden flex items-center justify-center w-screen h-screen opacity-0"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://assets.mixkit.co/videos/1943/1943-720.mp4"
            type="video/mp4"
          />
        </video>
      </div>
    </div>
  );
};

OpeningAnimation.displayName = "OpeningAnimation";
export default OpeningAnimation;
