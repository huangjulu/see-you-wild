"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Button from "@/components/atoms/Button";

function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ delay: 4.5 });

      tl.fromTo(
        ".hero-headline",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      );

      tl.fromTo(
        ".hero-subtitle",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        "-=0.5"
      );

      tl.fromTo(
        ".hero-cta",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.4"
      );

      tl.fromTo(
        ".hero-scroll",
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        "-=0.2"
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden"
      aria-label="Hero"
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
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(26, 33, 27, 0.4)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-4xl">
        <h1
          className="hero-headline text-4xl md:text-6xl lg:text-7xl text-white leading-tight"
          style={{ fontFamily: "var(--font-display)", opacity: 0 }}
        >
          重塑邊界，
          <br />
          <span className="italic">Elegantly</span> 撒野。
        </h1>
        <p
          className="hero-subtitle text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed font-sans"
          style={{ opacity: 0 }}
        >
          在山海之間，找到野性與優雅的平衡。
          <br className="hidden md:block" />
          See You Wild 帶你體驗台灣最獨特的戶外探險。
        </p>
        <div className="hero-cta mt-4" style={{ opacity: 0 }}>
          <Button variant="ghost" href="#journeys">
            探索旅程
          </Button>
        </div>
      </div>

      <div
        className="hero-scroll absolute bottom-8 z-10"
        style={{ opacity: 0 }}
      >
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-xs tracking-[0.2em] uppercase">Scroll</span>
          <div className="w-px h-8 bg-white/40 animate-bounce-slow" />
        </div>
      </div>
    </section>
  );
}

HeroSection.displayName = "HeroSection";
export default HeroSection;
