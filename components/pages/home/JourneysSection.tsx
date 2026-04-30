"use client";

import React, { useRef } from "react";

import JourneyCard from "@/components/pages/home/JourneyCard";
import Button from "@/components/ui/atoms/Button";
import { ScrollTrigger, useTimeline, useTween } from "@/lib/gsap";
import { useTranslations } from "@/lib/i18n/client";

const JourneysSection: React.FC = () => {
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

  return (
    <section
      ref={sectionRef}
      id="journeys"
      className="relative overflow-hidden bg-surface-brand bg-linear-180 from-journeys-gradient-from to-surface-brand from-[-15%] to-105%"
    >
      <div className="h-screen flex flex-col justify-center py-8">
        <div className="max-w-7xl mx-auto w-full px-6 md:px-12 mb-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="typo-overline text-sm mb-4 text-white/70">
                {t("overline")}
              </p>
              <h2 className="typo-display text-4xl md:text-5xl text-white">
                {t("title")}
              </h2>
            </div>
            <Button
              theme="link"
              href="/events"
              className="text-white/70 hover:text-white"
            >
              {t("exploreMore")}
            </Button>
          </div>
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
    </section>
  );
};

JourneysSection.displayName = "JourneysSection";
export default JourneysSection;

const JOURNEY_KEYS = [
  "hot-spring",
  "camping",
  "sup",
  "tree-climbing",
  "river-tracing",
] as const;

const JOURNEY_IMAGES = [
  "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&q=80",
  "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=600&q=80",
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80",
];
