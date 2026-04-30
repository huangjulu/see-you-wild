"use client";

import gsap from "gsap";
import React, { useEffect, useRef } from "react";

import TestimonialCard from "@/components/pages/home/TestimonialCard";
import { ScrollTrigger, useTimeline } from "@/lib/gsap";
import { useTranslations } from "@/lib/i18n/client";
import { useReducedMotion } from "@/stores/motion";

const GHOST_PARALLAX_FACTOR = -25; // 背景反向
const REPEL_RANGE = 320; // 卡片感應鼠標的半徑（px），超出不反應
const REPEL_MAX = 10; // 被鼠標推開的最大距離（px）
const LIFT_MAX = 35; // 越靠近鼠標 translateZ 越大，前景浮起感

const TestimonialsSection: React.FC = () => {
  const t = useTranslations("home.testimonials");
  const sectionRef = useRef<HTMLElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useTimeline(
    sectionRef,
    (tl, el) => {
      const cards = gsap.utils.toArray<HTMLElement>(".testimonial-card", el);
      cards.forEach((card, i) => {
        const dir = CARD_OFFSETS[i];
        tl.fromTo(
          card,
          { x: dir.fromX, y: dir.fromY, opacity: 0 },
          {
            x: 0,
            y: 0,
            opacity: 1,
            duration: 1.3,
            ease: "power3.out",
          },
          i * 0.18
        );
      });
      ScrollTrigger.create({
        trigger: el,
        start: "top 40%",
        animation: tl,
        toggleActions: "play reverse play reverse",
      });
    },
    { paused: true }
  );

  // TODO(抽成 useMouseParallax hook)：未來若其他 section 也要做滑鼠視差，
  // 把這段提取到 lib/gsap/useMouseParallax.ts，參數接 scope ref / target ref / factor / duration。
  useEffect(
    function mouseParallax() {
      if (reduceMotion) return;
      const section = sectionRef.current;
      const ghost = ghostRef.current;
      if (!section || !ghost) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;

      const ghostX = gsap.quickTo(ghost, "x", {
        duration: 0.6,
        ease: "power3",
      });
      const ghostY = gsap.quickTo(ghost, "y", {
        duration: 0.6,
        ease: "power3",
      });

      const repels = gsap.utils
        .toArray<HTMLElement>(".testimonial-repel", section)
        .map((el) => ({
          el,
          xTo: gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" }),
          yTo: gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" }),
          zTo: gsap.quickTo(el, "z", { duration: 0.5, ease: "power3" }),
        }));

      let isInView = false;
      const observer = new IntersectionObserver(
        (entries) => {
          isInView = entries[0]?.isIntersecting ?? false;
        },
        { threshold: 0 }
      );
      observer.observe(section);

      const handleMove = (e: PointerEvent) => {
        if (!isInView) return;
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        ghostX(nx * GHOST_PARALLAX_FACTOR);
        ghostY(ny * GHOST_PARALLAX_FACTOR);

        repels.forEach(({ el, xTo, yTo, zTo }) => {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const distance = Math.hypot(dx, dy);

          if (distance > REPEL_RANGE) {
            xTo(0);
            yTo(0);
            zTo(0);
            return;
          }

          const intensity = 1 - distance / REPEL_RANGE; // 0 ~ 1，越近越強
          const dirX = distance === 0 ? 0 : -dx / distance;
          const dirY = distance === 0 ? 0 : -dy / distance;

          xTo(dirX * REPEL_MAX * intensity);
          yTo(dirY * REPEL_MAX * intensity);
          zTo(intensity * LIFT_MAX);
        });
      };
      window.addEventListener("pointermove", handleMove);

      return () => {
        window.removeEventListener("pointermove", handleMove);
        observer.disconnect();
      };
    },
    [reduceMotion]
  );

  return (
    <section
      ref={sectionRef}
      className="bg-linear-180 from-background to-primary-100"
    >
      <div className="relative py-24 md:py-32 px-6 md:px-12 [mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_95%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_95%,transparent_100%)]">
        <div
          ref={ghostRef}
          className="absolute inset-0 will-change-transform pointer-events-none"
          aria-hidden="true"
        >
          <GhostCardsSvg />
        </div>

        {/* Radial gradient mask — fade out edge ghost cards */}
        <div
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,transparent_40%,var(--color-primary-100)_90%)]"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="typo-overline text-sm mb-4 text-primary-500">
              {t("overline")}
            </p>
            <h2 className="typo-display text-4xl md:text-5xl text-foreground">
              {t("title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 md:gap-y-14 max-w-5xl mx-auto [perspective:1200px]">
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
    </section>
  );
};

TestimonialsSection.displayName = "TestimonialsSection";
export default TestimonialsSection;

const CARD_OFFSETS = [
  {
    rotate: "rotate-[-2.5deg]",
    wrapper: "md:translate-y-0",
    fromX: -220,
    fromY: -140,
  },
  {
    rotate: "rotate-[1.8deg]",
    wrapper: "md:translate-y-6",
    fromX: 0,
    fromY: -200,
  },
  {
    rotate: "rotate-[-1.2deg]",
    wrapper: "md:-translate-y-3",
    fromX: 220,
    fromY: -140,
  },
  {
    rotate: "rotate-[2.2deg]",
    wrapper: "md:translate-y-8",
    fromX: -220,
    fromY: 140,
  },
  {
    rotate: "rotate-[-1.8deg]",
    wrapper: "md:translate-y-2",
    fromX: 0,
    fromY: 200,
  },
  {
    rotate: "rotate-[1deg]",
    wrapper: "md:-translate-y-4",
    fromX: 220,
    fromY: 140,
  },
];

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
          fill="var(--color-primary-200)"
          opacity="0.5"
        />
        <rect
          x={card.w * 0.12}
          y={card.h * 0.15}
          width={card.w * 0.76}
          height={4}
          rx={2}
          fill="var(--color-primary-300)"
          opacity="0.7"
        />
        <rect
          x={card.w * 0.12}
          y={card.h * 0.15 + 14}
          width={card.w * 0.6}
          height={4}
          rx={2}
          fill="var(--color-primary-300)"
          opacity="0.7"
        />
        <rect
          x={card.w * 0.12}
          y={card.h * 0.15 + 28}
          width={card.w * 0.68}
          height={4}
          rx={2}
          fill="var(--color-primary-300)"
          opacity="0.7"
        />
        <rect
          x={card.w * 0.12}
          y={card.h * 0.15 + 42}
          width={card.w * 0.45}
          height={4}
          rx={2}
          fill="var(--color-primary-300)"
          opacity="0.7"
        />
        <rect
          x={card.w * 0.12}
          y={card.h * 0.75}
          width={card.w * 0.3}
          height={3}
          rx={1.5}
          fill="var(--color-primary-300)"
          opacity="0.5"
        />
        <rect
          x={card.w * 0.12}
          y={card.h * 0.75 + 10}
          width={card.w * 0.4}
          height={3}
          rx={1.5}
          fill="var(--color-primary-300)"
          opacity="0.4"
        />
      </g>
    ))}
  </svg>
);
