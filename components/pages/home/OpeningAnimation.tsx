"use client";

import React, { useRef } from "react";
import { SplitText } from "gsap/SplitText";
import { useTimeline, ScrollTrigger } from "@/lib/gsap";

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

      tl.call(() => split.revert(), [], "reveal+=1.3");

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
      onComplete: () => {
        const el = containerRef.current;
        if (el) {
          el.style.display = "none";
          el.setAttribute("aria-hidden", "true");
        }
        // lockScroll 解除後，layout 可能改變，叫 ScrollTrigger 重算位置。
        ScrollTrigger.refresh();
      },
    },
    "opening-done"
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-deep"
    >
      <div ref={brandRef} className="absolute z-10 text-center opacity-0">
        <h1
          className="typo-display text-6xl md:text-6xl lg:text-7xl text-white leading-tight [text-shadow:0_0_12px_color-mix(in_srgb,var(--color-accent-fg)_50%,transparent)]"
          aria-hidden="true"
        >
          See You Wild
        </h1>
      </div>
      <div
        ref={videoWrapRef}
        className="relative overflow-hidden flex items-center justify-center w-screen h-screen opacity-0"
      >
        {/* translate-y 要跟 HeroSection video 的 useTween from.y 同步，否則 Opening→Hero 接手會跳。 */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute bottom-0 left-0 w-full h-[180%] object-cover translate-y-[40vh]"
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
