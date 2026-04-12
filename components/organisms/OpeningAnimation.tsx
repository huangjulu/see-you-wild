"use client";

import React, { useRef } from "react";
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

      tl.fromTo(
        brand,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      );

      tl.to(brand, { duration: 0.6 });

      tl.fromTo(videoWrap, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      tl.to(videoWrap, {
        width: "70vw",
        height: "50vh",
        borderRadius: "2rem",
        duration: 1,
        ease: "power3.inOut",
      });

      tl.to(brand, { opacity: 0, duration: 0.4, ease: "power2.in" }, "-=0.6");

      tl.to(videoWrap, {
        width: "100vw",
        height: "100vh",
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
        <p className="typo-display text-5xl md:text-7xl tracking-[0.3em] text-white">
          AURA WILD
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
