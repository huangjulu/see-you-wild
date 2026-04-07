"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

function OpeningAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDone, setIsDone] = useState(false);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          setIsDone(true);
        },
      });

      document.body.style.overflow = "hidden";

      // Phase 1: Brand text fades in
      tl.fromTo(
        ".opening-brand",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      );

      // Phase 2: Hold brand text
      tl.to(".opening-brand", { duration: 0.6 });

      // Phase 3: Video shrinks to rounded card
      tl.fromTo(
        ".opening-video-wrap",
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
      tl.to(".opening-video-wrap", {
        width: "70vw",
        height: "50vh",
        borderRadius: "2rem",
        duration: 1,
        ease: "power3.inOut",
      });

      // Phase 4: Brand text fades out
      tl.to(
        ".opening-brand",
        { opacity: 0, duration: 0.4, ease: "power2.in" },
        "-=0.6"
      );

      // Phase 5: Video expands back to fullscreen
      tl.to(".opening-video-wrap", {
        width: "100vw",
        height: "100vh",
        borderRadius: "0rem",
        duration: 1,
        ease: "power3.inOut",
      });

      // Phase 6: Overlay fades out to reveal the page
      tl.to(".opening-overlay", {
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  if (isDone) return null;

  return (
    <div
      ref={containerRef}
      className="opening-overlay fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "#1A211B" }}
    >
      <div
        className="opening-brand absolute z-10 text-center"
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
        className="opening-video-wrap relative overflow-hidden flex items-center justify-center"
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
}

OpeningAnimation.displayName = "OpeningAnimation";
export default OpeningAnimation;
