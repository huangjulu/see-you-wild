"use client";

import React, { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const OpeningAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const [isDone, setIsDone] = useState(false);

  useGSAP(
    function animateOpening() {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReduced) {
        setIsDone(true);
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent("opening-animation-complete"));
        });
        return;
      }

      const brand = brandRef.current;
      const videoWrap = videoWrapRef.current;
      const overlay = containerRef.current;
      if (!brand || !videoWrap || !overlay) return;

      document.body.style.overflow = "hidden";

      const tl = gsap.timeline({
        onComplete() {
          document.body.style.overflow = "";
          setIsDone(true);
          window.dispatchEvent(new CustomEvent("opening-animation-complete"));
        },
      });

      // Phase 1: Brand text fades in
      tl.fromTo(
        brand,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      );

      // Phase 2: Hold brand text
      tl.to(brand, { duration: 0.6 });

      // Phase 3: Video shrinks to rounded card
      tl.fromTo(videoWrap, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      tl.to(videoWrap, {
        width: "70vw",
        height: "50vh",
        borderRadius: "2rem",
        duration: 1,
        ease: "power3.inOut",
      });

      // Phase 4: Brand text fades out
      tl.to(brand, { opacity: 0, duration: 0.4, ease: "power2.in" }, "-=0.6");

      // Phase 5: Video expands back to fullscreen
      tl.to(videoWrap, {
        width: "100vw",
        height: "100vh",
        borderRadius: "0rem",
        duration: 1,
        ease: "power3.inOut",
      });

      // Phase 6: Overlay fades out to reveal the page
      tl.to(overlay, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });

      return () => {
        document.body.style.overflow = "";
      };
    },
    { scope: containerRef }
  );

  if (isDone) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "#1A211B" }}
    >
      <div
        ref={brandRef}
        className="absolute z-10 text-center"
        style={{ opacity: 0 }}
      >
        <p
          className="text-5xl md:text-7xl tracking-[0.3em] text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          AURA WILD
        </p>
      </div>
      <div
        ref={videoWrapRef}
        className="relative overflow-hidden flex items-center justify-center"
        style={{ width: "100vw", height: "100vh", opacity: 0 }}
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
