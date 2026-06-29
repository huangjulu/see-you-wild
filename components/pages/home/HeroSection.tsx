"use client";

import { useEffect, useRef } from "react";

import Button from "@/components/ui/atoms/Button";
import { ScrollTrigger, useTimeline, useTween } from "@/lib/gsap";
import { useTranslations } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/stores/motion";

const HeroSection = () => {
  const t = useTranslations("home.hero");
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const subtitlesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useTimeline(
    sectionRef,
    (tl, el) => {
      const h1 = h1Ref.current;
      const subtitles = subtitlesRef.current?.children;
      const cta = ctaRef.current;
      if (!h1 || !subtitles || !cta) return;

      tl.fromTo(
        h1,
        { opacity: 0 },
        { opacity: 1, duration: 0.9, ease: "power3.out" }
      );
      tl.fromTo(
        subtitles,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.2 },
        "-=0.5"
      );
      tl.fromTo(
        cta,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.4"
      );

      // 一次性：捲過 50px 才播放標題群進場（影片背景不受影響）
      ScrollTrigger.create({
        trigger: el,
        start: "top top-=50",
        once: true,
        onEnter: () => tl.play(),
      });
    },
    { paused: true }
  );

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

  useEffect(function startVideoAfterMount() {
    videoRef.current?.play().catch(() => {});
    mobileVideoRef.current?.play().catch(() => {});
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-8 md:px-16 overflow-hidden"
      aria-label="Hero"
    >
      <video
        ref={videoRef}
        poster={HERO_DESKTOP_POSTER}
        preload="none"
        muted
        loop
        playsInline
        className="absolute bottom-0 left-0 w-full h-[180%] object-cover will-change-transform pointer-events-none hidden md:block"
      >
        <source src={HERO_DESKTOP_VIDEO} type="video/mp4" />
      </video>
      <video
        ref={mobileVideoRef}
        poster={HERO_MOBILE_POSTER}
        preload="none"
        muted
        loop
        playsInline
        className="absolute bottom-0 left-0 w-full h-[180%] object-cover will-change-transform pointer-events-none md:hidden"
      >
        <source src={HERO_MOBILE_VIDEO} type="video/mp4" />
      </video>
      <div
        className="absolute inset-0 bg-neutral-950/40 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center max-w-4xl translate-y-[10vh] md:translate-y-0">
        <h1
          ref={h1Ref}
          className={cn(
            "typo-display text-5xl md:text-6xl lg:text-7xl text-white leading-tight [text-shadow:0_0_12px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]",
            !reduceMotion && "opacity-0"
          )}
        >
          See You Wild
        </h1>
        <div className="absolute top-full mt-6 flex flex-col items-center gap-4">
          <div ref={subtitlesRef} className="flex flex-col items-center">
            <p
              className={cn(
                "typo-body text-base md:text-lg text-white/80 text-shadow-md",
                !reduceMotion && "opacity-0"
              )}
            >
              {t("subtitle")}
            </p>
            <p
              className={cn(
                "text-base text-white/60 italic tracking-widest text-shadow-md",
                !reduceMotion && "opacity-0"
              )}
            >
              {t("subtitleEn")}
            </p>
          </div>
          <div
            ref={ctaRef}
            className={cn("mt-2", !reduceMotion && "opacity-0")}
          >
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

const R2_BASE = "https://pub-4f074e0ebf814197a45996298c88925f.r2.dev/hero";
const HERO_DESKTOP_VIDEO = `${R2_BASE}/syw-hero-v3.mp4`;
const HERO_DESKTOP_POSTER = `${R2_BASE}/syw-hero-v3-poster.webp`;
const HERO_MOBILE_VIDEO = `${R2_BASE}/syw-hero-v3-mobile.mp4`;
const HERO_MOBILE_POSTER = `${R2_BASE}/syw-hero-v3-mobile-poster.webp`;
