"use client";

import React, { useRef } from "react";
import { useTimeline, useTween } from "@/lib/gsap";
import Button from "@/components/atoms/Button";

const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const subtitlesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useTimeline(
    sectionRef,
    (tl) => {
      const cta = ctaRef.current;
      const scroll = scrollRef.current;
      const subtitles = subtitlesRef.current?.children;
      if (!subtitles || !cta || !scroll) return;

      tl.fromTo(
        subtitles,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.2,
        }
      );

      tl.fromTo(
        cta,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.4"
      );

      tl.fromTo(scroll, { opacity: 0 }, { opacity: 1, duration: 0.8 }, "-=0.3");
    },
    { paused: true },
    "opening-done"
  );

  const OFFSET_TOP = 0.4; // 要跟 OpeningAnimation video 的 translate-y-[40vh] 同步
  const PARALLEX_ANIMATE = 0.3; // offset + 0.3 ≤ video h-180% 的 buffer (0.8) 才不會露出空白

  useTween(sectionRef, {
    selector: "video",
    from: { y: () => window.innerHeight * OFFSET_TOP },
    to: {
      y: () => window.innerHeight * (OFFSET_TOP + PARALLEX_ANIMATE),
      scrollTrigger: {
        trigger: "[aria-label='Hero']",
        start: "top top",
        end: "+=100%",
        scrub: true,
        invalidateOnRefresh: true,
      },
    },
  });

  useTween(sectionRef, {
    selector: "h1",
    to: {
      y: () => -window.innerHeight * 0.15,
      ease: "none",
      scrollTrigger: {
        trigger: "[aria-label='Hero']",
        start: "top top",
        end: "+=100%",
        scrub: true,
        invalidateOnRefresh: true,
      },
    },
  });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden"
      aria-label="Hero"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute bottom-0 left-0 w-full h-[180%] object-cover will-change-transform"
      >
        <source
          src="https://assets.mixkit.co/videos/1943/1943-720.mp4"
          type="video/mp4"
        />
      </video>
      <div className="absolute inset-0 bg-neutral-950/40" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center max-w-4xl">
        <h1 className="typo-display text-4xl md:text-6xl lg:text-7xl text-white leading-tight">
          See You Wild
        </h1>
        <div className="absolute top-full mt-6 flex flex-col items-center gap-4">
          <div ref={subtitlesRef} className="flex flex-col items-center gap-4">
            <p className="typo-body text-lg md:text-xl text-white/80 opacity-0">
              在山與海之間
            </p>
            <p className="text-3xl md:text-lg text-white/60 italic opacity-0 tracking-widest">
              Where wild meets grace
            </p>
          </div>
          <div ref={ctaRef} className="mt-2 opacity-0">
            <Button theme="ghost" href="#journeys">
              探索旅程
            </Button>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="absolute bottom-8 z-10">
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
