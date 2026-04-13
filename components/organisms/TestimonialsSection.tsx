"use client";

import React, { useRef } from "react";
import { useScrollReveal } from "@/lib/gsap";
import { useTranslations } from "@/lib/i18n/client";
import TestimonialCard from "@/components/molecules/TestimonialCard";

const TESTIMONIAL_KEYS = [
  "ava",
  "james",
  "mei",
  "chris",
  "sophie",
  "david",
] as const;

/* ─── SVG Ghost Cards Background ─── */

const GHOST_CARDS: Array<{
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
}> = [
  { x: 20, y: 30, w: 180, h: 220, rotate: -8 },
  { x: 120, y: 80, w: 160, h: 200, rotate: 5 },
  { x: -40, y: 180, w: 170, h: 210, rotate: 12 },
  { x: 820, y: 20, w: 175, h: 215, rotate: -4 },
  { x: 950, y: 60, w: 165, h: 205, rotate: 9 },
  { x: 1080, y: 30, w: 180, h: 220, rotate: -11 },
  { x: -20, y: 380, w: 170, h: 210, rotate: 6 },
  { x: 80, y: 450, w: 160, h: 200, rotate: -3 },
  { x: 1000, y: 350, w: 175, h: 215, rotate: -7 },
  { x: 1100, y: 420, w: 165, h: 205, rotate: 4 },
  { x: 30, y: 600, w: 180, h: 220, rotate: -10 },
  { x: 140, y: 680, w: 160, h: 200, rotate: 7 },
  { x: -30, y: 760, w: 170, h: 210, rotate: -5 },
  { x: 900, y: 580, w: 175, h: 215, rotate: 8 },
  { x: 1050, y: 650, w: 165, h: 205, rotate: -6 },
  { x: 1120, y: 740, w: 180, h: 220, rotate: 3 },
  { x: 350, y: -20, w: 155, h: 195, rotate: -14 },
  { x: 600, y: -10, w: 165, h: 205, rotate: 6 },
  { x: 400, y: 780, w: 170, h: 210, rotate: -8 },
  { x: 680, y: 800, w: 160, h: 200, rotate: 11 },
];

const GhostCardsSvg: React.FC = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    viewBox="0 0 1280 900"
    preserveAspectRatio="xMidYMid slice"
    fill="none"
    aria-hidden="true"
  >
    {GHOST_CARDS.map((card, i) => (
      <g
        key={i}
        transform={`translate(${card.x + card.w / 2}, ${card.y + card.h / 2}) rotate(${card.rotate}) translate(${-card.w / 2}, ${-card.h / 2})`}
      >
        <rect
          width={card.w}
          height={card.h}
          fill="var(--color-neutral-100)"
          opacity="0.5"
        />
        <rect
          x={card.w * 0.12}
          y={card.h * 0.15}
          width={card.w * 0.76}
          height={4}
          rx={2}
          fill="var(--color-neutral-200)"
          opacity="0.7"
        />
        <rect
          x={card.w * 0.12}
          y={card.h * 0.15 + 14}
          width={card.w * 0.6}
          height={4}
          rx={2}
          fill="var(--color-neutral-200)"
          opacity="0.7"
        />
        <rect
          x={card.w * 0.12}
          y={card.h * 0.15 + 28}
          width={card.w * 0.68}
          height={4}
          rx={2}
          fill="var(--color-neutral-200)"
          opacity="0.7"
        />
        <rect
          x={card.w * 0.12}
          y={card.h * 0.15 + 42}
          width={card.w * 0.45}
          height={4}
          rx={2}
          fill="var(--color-neutral-200)"
          opacity="0.7"
        />
        <rect
          x={card.w * 0.12}
          y={card.h * 0.75}
          width={card.w * 0.3}
          height={3}
          rx={1.5}
          fill="var(--color-neutral-200)"
          opacity="0.5"
        />
        <rect
          x={card.w * 0.12}
          y={card.h * 0.75 + 10}
          width={card.w * 0.4}
          height={3}
          rx={1.5}
          fill="var(--color-neutral-200)"
          opacity="0.4"
        />
      </g>
    ))}
  </svg>
);

/* ─── Main Section ─── */

const TestimonialsSection: React.FC = () => {
  const t = useTranslations("home.testimonials");
  const sectionRef = useRef<HTMLElement>(null);

  useScrollReveal(sectionRef, {
    selector: ".testimonial-card",
    from: { opacity: 0 },
    to: {
      opacity: 1,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        start: "top 80%",
        toggleActions: "play none none none",
      },
    },
  });

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-6 md:px-12">
      {/* Rounded clip container */}
      <div className="rounded-3xl overflow-hidden">
        <div className="relative bg-neutral-50 py-24 md:py-32 px-6 md:px-12">
          {/* SVG ghost cards background */}
          <GhostCardsSvg />

          {/* Radial gradient mask — fade out edge ghost cards */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, var(--color-neutral-50) 90%)",
            }}
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <p className="typo-overline text-sm mb-4 text-muted-warm">
                {t("overline")}
              </p>
              <h2 className="typo-display text-4xl md:text-5xl text-foreground">
                {t("title")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 md:gap-y-14 max-w-5xl mx-auto">
              {TESTIMONIAL_KEYS.map((key, i) => (
                <TestimonialCard
                  key={key}
                  quote={t(`items.${key}.quote`)}
                  author={t(`items.${key}.author`)}
                  trip={t(`items.${key}.trip`)}
                  rotate={CARD_OFFSETS[i].rotate}
                  wrapperOffset={CARD_OFFSETS[i].wrapper}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

TestimonialsSection.displayName = "TestimonialsSection";
export default TestimonialsSection;

const CARD_OFFSETS = [
  { rotate: "rotate-[-2.5deg]", wrapper: "md:translate-y-0" },
  { rotate: "rotate-[1.8deg]", wrapper: "md:translate-y-6" },
  { rotate: "rotate-[-1.2deg]", wrapper: "md:-translate-y-3" },
  { rotate: "rotate-[2.2deg]", wrapper: "md:translate-y-8" },
  { rotate: "rotate-[-1.8deg]", wrapper: "md:translate-y-2" },
  { rotate: "rotate-[1deg]", wrapper: "md:-translate-y-4" },
];
