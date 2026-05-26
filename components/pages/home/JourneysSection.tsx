"use client";

import {
  ArrowRight as IconArrowRight,
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

import JourneyCard from "@/components/pages/home/JourneyCard";
import Button from "@/components/ui/atoms/Button";
import Heading from "@/components/ui/atoms/Heading";
import { ScrollTrigger, useTimeline, useTween } from "@/lib/gsap";
import { useTranslations } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const JourneysSection = () => {
  const t = useTranslations("home.journeys");
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const navTriggerRef = useRef<ScrollTrigger | null>(null);

  useTween(trackRef, {
    selector: ".journey-card",
    from: { opacity: 0, y: 40 },
    to: {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.in",
      scrollTrigger: {
        start: "top 60%",
        toggleActions: "play reverse play reverse",
      },
    },
  });

  useTimeline(sectionRef, (tl, el) => {
    const track = trackRef.current;
    if (!track) return;

    tl.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: "none",
      duration: 1,
    }).to({}, { duration: 0.5, ease: "power2.out" });

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: () => `+=${(track.scrollWidth - window.innerWidth) * 1.5}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      animation: tl,
      onUpdate: (self) => {
        const horizontalEnd = 1 / 1.5;
        setAtStart(self.progress < 0.03);
        setAtEnd(self.progress >= horizontalEnd - 0.02);
      },
    });

    navTriggerRef.current = st;
  });

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const st = navTriggerRef.current;
    const track = trackRef.current;
    if (!st || !track) return;

    const isMobile = window.innerWidth < 768;
    const cardStep = isMobile ? 264 : 444;
    const totalHorizontal = track.scrollWidth - window.innerWidth;
    const totalVertical = st.end - st.start;
    const delta = (cardStep / totalHorizontal) * totalVertical * direction;

    const target = Math.max(st.start, Math.min(st.end, window.scrollY + delta));
    window.scrollTo({ top: target, behavior: "smooth" });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="journeys"
      className="relative bg-surface-brand bg-linear-180 from-journeys-gradient-from to-surface-brand from-[-15%] to-105%"
    >
      <div className="flex flex-col pt-28 pb-24 md:pt-40 md:pb-32">
        <div className="max-w-7xl mx-auto w-full px-8 md:px-16 mb-7 flex items-end justify-between">
          <div>
            <Heading.H2
              variant="display"
              overline={t("overline")}
              overlineClassName="mb-2 text-white/70"
              className="text-white"
            >
              {t("title")}
            </Heading.H2>
          </div>
          <Button
            theme="text"
            href="/events"
            className="text-white/70 hover:text-white hover:opacity-100"
          >
            {t("exploreMore")}
            <IconArrowRight size={16} />
          </Button>
        </div>
        <div
          ref={trackRef}
          className="flex gap-6 px-[max(calc((100vw-80rem)/2+1.5rem),1.5rem)] md:px-[max(calc((100vw-80rem)/2+3rem),3rem)] w-fit"
        >
          {JOURNEY_KEYS.map((key, i) => (
            <JourneyCard
              key={key}
              title={t(`items.${key}.title`)}
              subtitle={t(`items.${key}.subtitle`)}
              image={JOURNEY_IMAGES[i]}
              href={`/events?type=${key}`}
            />
          ))}
        </div>
      </div>
      <div className="absolute inset-0 z-10 pointer-events-none">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label="Scroll to first activity"
          className={cn(
            "pointer-events-auto absolute top-1/2 -translate-y-1/2 left-4 md:left-8",
            "w-10 h-10 md:w-12 md:h-12 rounded-full",
            "bg-surface-deep/50 backdrop-blur-sm text-white",
            "hover:bg-surface-deep/70 transition-colors duration-300",
            "flex items-center justify-center transition-opacity duration-300",
            atStart ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <IconChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label="Scroll to last activity"
          className={cn(
            "pointer-events-auto absolute top-1/2 -translate-y-1/2 right-4 md:right-8",
            "w-10 h-10 md:w-12 md:h-12 rounded-full",
            "bg-surface-deep/50 backdrop-blur-sm text-white",
            "hover:bg-surface-deep/70 transition-colors duration-300",
            "flex items-center justify-center transition-opacity duration-300",
            atEnd ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <IconChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        className="block w-full h-[32px] md:h-[48px] -mb-[32px] md:-mb-[48px] relative z-10"
      >
        <path
          d="M0,26 C60,22 140,32 240,28 S400,18 520,24 S700,38 840,30 S1020,12 1140,22 S1320,36 1440,28"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeOpacity="0.35"
          strokeLinecap="round"
        />
        <path
          d="M0,22 C80,18 180,28 300,24 S460,14 600,20 S780,34 920,26 S1080,10 1200,18 S1360,30 1440,24"
          fill="none"
          stroke="white"
          strokeWidth="1.2"
          strokeOpacity="0.2"
          strokeLinecap="round"
          strokeDasharray="8 12"
        />
        <path
          d="M0,30 C120,34 200,18 320,22 S520,40 660,30 S860,10 980,20 S1160,38 1280,28 S1400,18 1440,24 L1440,48 L0,48 Z"
          className="fill-background"
        />
      </svg>
    </section>
  );
};

JourneysSection.displayName = "JourneysSection";
export default JourneysSection;

const JOURNEY_KEYS = [
  "river-tracing",
  "sup",
  "yacht",
  "camping",
  "tree-climbing",
  "rafting",
] as const;

const R2_BASE = "https://pub-4f074e0ebf814197a45996298c88925f.r2.dev";

const JOURNEY_IMAGES = [
  `${R2_BASE}/home-journey-river-tracing.webp`,
  `${R2_BASE}/home-journey-sup.webp`,
  `${R2_BASE}/home-journey-yacht.webp`,
  `${R2_BASE}/home-journey-camping.webp`,
  `${R2_BASE}/home-journey-tree-climbing.webp`,
  `${R2_BASE}/home-journey-rafting.webp`,
];
