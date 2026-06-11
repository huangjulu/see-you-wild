"use client";

import { useRef } from "react";

import Button from "@/components/ui/atoms/Button";
import { useTimeline, useTween } from "@/lib/gsap";
import { useTranslations } from "@/lib/i18n/client";

const HeroSection = () => {
  const t = useTranslations("home.hero");
  const sectionRef = useRef<HTMLElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const subtitlesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useTimeline(sectionRef, (tl) => {
    const subtitles = subtitlesRef.current?.children;
    const cta = ctaRef.current;
    const scroll = scrollRef.current;
    if (!subtitles || !cta || !scroll) return;

    tl.fromTo(
      subtitles,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.2 }
    );
    tl.fromTo(
      cta,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      "-=0.4"
    );
    tl.fromTo(scroll, { opacity: 0 }, { opacity: 1, duration: 0.8 }, "-=0.3");
  });

  const OFFSET_TOP = 0.4;
  const PARALLEX_ANIMATE = 0.3;

  useTween(sectionRef, {
    selector: "video",
    from: { y: () => window.innerHeight * OFFSET_TOP },
    to: {
      y: () => window.innerHeight * (OFFSET_TOP + PARALLEX_ANIMATE),
      scrollTrigger: {
        trigger: sectionRef,
        start: "top top",
        end: "+=100%",
        scrub: true,
        invalidateOnRefresh: true,
      },
    },
  });

  const parallaxTween = {
    to: {
      y: () => window.innerHeight * -0.15,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef,
        start: "top top",
        end: "+=100%",
        scrub: true,
        invalidateOnRefresh: true,
      },
    },
  };

  useTween(h1Ref, parallaxTween);
  useTween(subtitlesRef, parallaxTween);
  useTween(ctaRef, parallaxTween);
  useTween(scrollRef, parallaxTween);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-8 md:px-16 overflow-hidden"
      aria-label="Hero"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute bottom-0 left-0 w-full h-[180%] object-cover will-change-transform pointer-events-none"
      >
        <source
          src="https://pub-4f074e0ebf814197a45996298c88925f.r2.dev/hero/syw-hero-v2.mp4"
          type="video/mp4"
        />
      </video>
      <div
        className="absolute inset-0 bg-neutral-950/40 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center max-w-4xl">
        <h1
          ref={h1Ref}
          className="typo-display text-5xl md:text-6xl lg:text-7xl text-white leading-tight [text-shadow:0_0_12px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]"
        >
          See You Wild
        </h1>
        <div className="absolute top-full mt-6 flex flex-col items-center gap-4">
          <div ref={subtitlesRef} className="flex flex-col items-center">
            <p className="typo-body text-base md:text-lg text-white/80 opacity-0 text-shadow-md">
              {t("subtitle")}
            </p>
            <p className="text-base text-white/60 italic tracking-widest opacity-0 text-shadow-md">
              {t("subtitleEn")}
            </p>
          </div>
          <div ref={ctaRef} className="mt-2 opacity-0">
            <Button theme="ghost" href="#journeys">
              {t("exploreCta")}
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="absolute bottom-8 z-10 flex flex-col items-center gap-2 text-white/60 text-shadow-md"
      >
        <span className="text-xs tracking-[0.2em] uppercase">Scroll</span>
        <div className="w-px h-8 bg-white/40 animate-bounce-slow" />
      </div>
    </section>
  );
};

HeroSection.displayName = "HeroSection";
export default HeroSection;
