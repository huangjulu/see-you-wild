"use client";

import React, { useRef } from "react";
import { useTimeline } from "@/lib/gsap";
import Button from "@/components/atoms/Button";

const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useTimeline(sectionRef, (tl, el) => {
    const headline = el.querySelector(".hero-headline");
    const subtitle = el.querySelector(".hero-subtitle");
    const cta = el.querySelector(".hero-cta");
    const scroll = el.querySelector(".hero-scroll");

    function playEntrance() {
      tl.fromTo(
        headline,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
      );

      tl.fromTo(
        subtitle,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
        "-=0.6"
      );

      tl.fromTo(
        cta,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.5"
      );

      tl.fromTo(scroll, { opacity: 0 }, { opacity: 1, duration: 0.8 }, "-=0.3");
    }

    window.addEventListener("opening-animation-complete", playEntrance, {
      once: true,
    });

    return () => {
      window.removeEventListener("opening-animation-complete", playEntrance);
    };
  });

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
      <div className="absolute inset-0 bg-neutral-950/40" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-4xl">
        <h1 className="hero-headline gsap-reveal typo-display text-4xl md:text-6xl lg:text-7xl text-white leading-tight">
          重塑邊界，
          <br />
          <span className="italic">Elegantly</span> 撒野。
        </h1>
        <p className="hero-subtitle gsap-reveal typo-body text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
          在山海之間，找到野性與優雅的平衡。
          <br className="hidden md:block" />
          See You Wild 帶你體驗台灣最獨特的戶外探險。
        </p>
        <div className="hero-cta gsap-reveal mt-4">
          <Button theme="ghost" href="#journeys">
            探索旅程
          </Button>
        </div>
      </div>

      <div className="hero-scroll gsap-reveal absolute bottom-8 z-10">
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-xs tracking-[0.2em] uppercase">Scroll</span>
          <div className="w-px h-8 bg-white/40 animate-bounce-slow" />
        </div>
      </div>
    </section>
  );
};

HeroSection.displayName = "HeroSection";
export default HeroSection;
