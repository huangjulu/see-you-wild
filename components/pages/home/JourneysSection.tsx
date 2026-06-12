"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ArrowRight as IconArrowRight,
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
} from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

import JourneyCard from "@/components/pages/home/JourneyCard";
import Button from "@/components/ui/atoms/Button";
import Heading from "@/components/ui/atoms/Heading";
import { ScrollTrigger, useTween } from "@/lib/gsap";
import { useTranslations } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface JourneysSectionProps {
  typeImages?: Record<string, string>;
}

const JourneysSection: React.FC<JourneysSectionProps> = (props) => {
  const t = useTranslations("home.journeys");
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const navTriggerRef = useRef<ScrollTrigger | null>(null);

  // 進場用純淡入 stagger，不用 y 位移：transform 會被算進 overflow-x-auto track
  // 的 scrollable overflow region，y 位移會讓 track 多出垂直可捲動區域（不預期）。
  useTween(trackRef, {
    selector: ".journey-card",
    from: { opacity: 0 },
    to: {
      opacity: 1,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.in",
      scrollTrigger: {
        start: "top 60%",
        toggleActions: "play reverse play reverse",
      },
    },
  });

  // 桌機（>= 768px）才建立 pin + scrub 假橫向捲動；手機改用原生 CSS scroll-snap。
  // matchMedia 在不匹配 / reduced-motion 時自動 revert，手機不會 pin、不會 translate。
  useGSAP(
    function journeysHorizontalScroll() {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        function buildDesktopScroll(context) {
          const conditions = context.conditions;
          if (!conditions || !conditions.isDesktop || conditions.reduceMotion) {
            return;
          }

          const el = sectionRef.current;
          const track = trackRef.current;
          if (!el || !track) return;

          const tl = gsap.timeline();
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
            snap: {
              snapTo: (value) => {
                // 只在水平捲動段（progress 0 ~ 1/1.5）對齊卡片，停留段不 snap
                const horizontalEnd = 1 / 1.5;
                if (value >= horizontalEnd) return value;
                const totalHorizontal = track.scrollWidth - window.innerWidth;
                if (totalHorizontal <= 0) return value;
                const cardStep = 444;
                const segments = Math.max(
                  1,
                  Math.round(totalHorizontal / cardStep)
                );
                const stepProgress = horizontalEnd / segments;
                return Math.min(
                  Math.round(value / stepProgress) * stepProgress,
                  horizontalEnd
                );
              },
              duration: { min: 0.1, max: 0.3 },
              ease: "power2.out",
            },
            onUpdate: (self) => {
              const horizontalEnd = 1 / 1.5;
              setAtStart(self.progress < 0.03);
              setAtEnd(self.progress >= horizontalEnd - 0.02);
            },
          });

          navTriggerRef.current = st;

          return () => {
            navTriggerRef.current = null;
          };
        }
      );

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  const scrollByCard = useCallback((direction: 1 | -1) => {
    // 箭頭僅桌機顯示。pin 的水平捲動段 scroll : 卡片位移為 1:1，
    // 一張卡距離 = 卡片寬 444（w-105 420 + gap-6 24），不需再乘 end 的 1.5 倍率，
    // 否則一次會跳約 1.5~2 張卡。
    const st = navTriggerRef.current;
    if (!st) return;

    const cardStep = 444;
    const delta = cardStep * direction;
    const target = Math.max(st.start, Math.min(st.end, window.scrollY + delta));
    window.scrollTo({ top: target, behavior: "smooth" });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="journeys"
      className="relative overflow-x-clip bg-surface-brand bg-linear-180 from-journeys-gradient-from to-surface-brand from-[-15%] to-105%"
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
          className="flex gap-6 px-[max(calc((100vw-80rem)/2+2rem),2rem)] md:px-[max(calc((100vw-80rem)/2+4rem),4rem)] snap-x snap-mandatory scroll-pl-8 overflow-x-auto overflow-y-clip md:w-fit md:snap-none md:overflow-visible"
        >
          {JOURNEY_KEYS.map((key, i) => (
            <JourneyCard
              key={key}
              title={t(`items.${key}.title`)}
              subtitle={t(`items.${key}.subtitle`)}
              image={props.typeImages?.[key] ?? JOURNEY_IMAGES[i]}
              href={`/events?type=${key}`}
            />
          ))}
        </div>
      </div>
      <div className="absolute inset-0 z-10 pointer-events-none hidden md:block">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label="Scroll to first activity"
          className={cn(
            "pointer-events-auto absolute top-1/2 -translate-y-1/2 left-8",
            "w-12 h-12 rounded-full",
            "bg-surface-deep/50 backdrop-blur-sm text-white",
            "hover:bg-surface-deep/70 transition-colors duration-300",
            "flex items-center justify-center transition-opacity duration-300",
            atStart ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <IconChevronLeft className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label="Scroll to last activity"
          className={cn(
            "pointer-events-auto absolute top-1/2 -translate-y-1/2 right-8",
            "w-12 h-12 rounded-full",
            "bg-surface-deep/50 backdrop-blur-sm text-white",
            "hover:bg-surface-deep/70 transition-colors duration-300",
            "flex items-center justify-center transition-opacity duration-300",
            atEnd ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <IconChevronRight className="w-6 h-6" />
        </button>
      </div>
      <WaveSVG />
    </section>
  );
};

JourneysSection.displayName = "JourneysSection";
export default JourneysSection;

const WaveSVG = () => {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className="absolute bottom-0 left-0 w-full h-12 md:h-18 translate-y-1/2 z-10"
    >
      <path
        d="M0,72 C55,56 111,24 166,28 C222,32 277,68 332,76 C388,84 443,64 498,48 C554,32 609,20 665,28 C720,36 775,64 831,72 C886,80 942,68 997,52 C1052,36 1108,16 1163,20 C1218,24 1274,52 1329,64 C1385,76 1412,72 1440,68"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeOpacity="0.35"
        strokeLinecap="round"
      />
      <path
        d="M0,80 C72,64 144,28 222,24 C300,20 388,48 480,56 C554,62 609,44 720,36 C831,28 886,56 997,64 C1108,72 1163,40 1274,32 C1348,27 1400,44 1440,52"
        fill="none"
        stroke="white"
        strokeWidth="1.2"
        strokeOpacity="0.2"
        strokeLinecap="round"
        strokeDasharray="8 12"
      />
      <path
        d="M0,84 C55,68 111,32 166,24 C222,16 277,40 332,52 C388,64 443,72 498,60 C554,48 609,16 665,12 C720,8 775,32 831,48 C886,64 942,76 997,68 C1052,60 1108,28 1163,20 C1218,12 1274,28 1329,44 C1385,60 1412,72 1440,76 L1440,120 L0,120 Z"
        className="fill-background"
      />
    </svg>
  );
};

const JOURNEY_KEYS = [
  "river-tracing",
  "sup",
  "yacht",
  "camping",
  "tree-climbing",
  "rafting",
] as const;

const JOURNEY_IMAGES = [
  "/images/journeys/river-tracing.webp",
  "/images/journeys/sup.webp",
  "/images/journeys/yacht.webp",
  "/images/journeys/camping.webp",
  "/images/journeys/tree-climbing.webp",
  "/images/journeys/rafting.webp",
];
