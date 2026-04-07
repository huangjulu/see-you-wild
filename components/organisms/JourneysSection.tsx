"use client";

import React, { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import JourneyCard from "@/components/molecules/JourneyCard";

const JOURNEYS = [
  {
    title: "野溪溫泉秘境",
    subtitle: "Hot Spring",
    image:
      "https://images.unsplash.com/photo-1600298881979-66e5d5e29a09?w=600&q=80",
  },
  {
    title: "星空野營私廚",
    subtitle: "Wild Camping",
    image:
      "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=600&q=80",
  },
  {
    title: "SUP 立槳日出團",
    subtitle: "Paddleboarding",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
  },
  {
    title: "攀樹森林浴",
    subtitle: "Tree Climbing",
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80",
  },
  {
    title: "溯溪探險",
    subtitle: "River Tracing",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80",
  },
];

const JourneysSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    function setupHorizontalScroll() {
      if (!trackRef.current || !sectionRef.current) return;

      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      const track = trackRef.current;
      const scrollWidth = track.scrollWidth - track.clientWidth;

      // Hide native scrollbar when GSAP takes over
      track.style.overflow = "hidden";

      gsap.to(track, {
        x: -scrollWidth,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${scrollWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="journeys"
      className="relative overflow-hidden"
      style={{ backgroundColor: "#1A211B" }}
    >
      <div className="h-screen flex flex-col justify-center">
        <div className="px-6 md:px-12 mb-10">
          <p
            className="text-sm tracking-[0.3em] uppercase mb-4"
            style={{ color: "#A69B8D" }}
          >
            Journeys
          </p>
          <h2
            className="text-4xl md:text-5xl text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            探索旅程
          </h2>
        </div>
        <div
          ref={trackRef}
          className="flex gap-6 px-6 md:px-12 overflow-x-auto"
        >
          {JOURNEYS.map((journey) => (
            <JourneyCard
              key={journey.title}
              title={journey.title}
              subtitle={journey.subtitle}
              image={journey.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

JourneysSection.displayName = "JourneysSection";
export default JourneysSection;
