"use client";

import {
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
} from "lucide-react";
import { useRef } from "react";

import JourneyCard from "@/components/pages/home/JourneyCard";
import Button from "@/components/ui/atoms/Button";
import Heading from "@/components/ui/atoms/Heading";
import { ScrollTrigger, useTimeline, useTween } from "@/lib/gsap";
import { useJourneyNav } from "@/lib/gsap/useJourneyNav";
import { useTranslations } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const JourneysSection = () => {
  const t = useTranslations("home.journeys");
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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

    ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: () => `+=${(track.scrollWidth - window.innerWidth) * 1.5}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      animation: tl,
    });
  });

  const { isVisible, atEnd, scrollToStart, scrollToEnd } =
    useJourneyNav(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="journeys"
      className="relative overflow-hidden bg-surface-brand bg-linear-180 from-journeys-gradient-from to-surface-brand from-[-15%] to-105%"
    >
      <div className="h-screen flex flex-col justify-center py-8">
        <div className="max-w-7xl mx-auto w-full px-10 md:px-16 mb-7 flex items-end justify-between">
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
            theme="link"
            href="/events"
            className="text-white/70 hover:text-white"
          >
            {t("exploreMore")}
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
      <div
        className={cn(
          "absolute inset-0 z-10 pointer-events-none transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <button
          type="button"
          onClick={scrollToStart}
          aria-label="Scroll to first activity"
          className={cn(
            "pointer-events-auto absolute top-1/2 -translate-y-1/2 left-4 md:left-8",
            "w-10 h-10 md:w-12 md:h-12 rounded-full",
            "bg-surface-deep/50 backdrop-blur-sm text-white",
            "hover:bg-surface-deep/70 transition-colors duration-300",
            "flex items-center justify-center",
            atEnd ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <IconChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button
          type="button"
          onClick={scrollToEnd}
          aria-label="Scroll to last activity"
          className={cn(
            "pointer-events-auto absolute top-1/2 -translate-y-1/2 right-4 md:right-8",
            "w-10 h-10 md:w-12 md:h-12 rounded-full",
            "bg-surface-deep/50 backdrop-blur-sm text-white",
            "hover:bg-surface-deep/70 transition-colors duration-300",
            "flex items-center justify-center",
            atEnd ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <IconChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
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
