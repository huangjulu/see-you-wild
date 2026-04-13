"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useTimeline } from "@/lib/gsap";
import JourneyCard from "@/components/molecules/JourneyCard";
import Button from "@/components/atoms/Button";

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

  useTimeline(sectionRef, (tl, el) => {
    const track = trackRef.current;
    if (!track) return;

    const cards = track.querySelectorAll(".journey-card");
    const getDistance = () => -(track.scrollWidth - window.innerWidth);

    // Card entrance stagger (one-shot, not scrub)
    gsap.fromTo(
      cards,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 60%",
          toggleActions: "play none none none",
        },
      }
    );

    // Horizontal scrub scroll
    tl.to(track, {
      x: getDistance,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top top",
        end: () => `+=${track.scrollWidth - window.innerWidth}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  });

  return (
    <section
      ref={sectionRef}
      id="journeys"
      className="relative overflow-hidden bg-surface-dark"
    >
      <div className="h-screen flex flex-col justify-center pt-16">
        <div className="flex items-end justify-between px-6 md:px-12 mb-10">
          <div>
            <p className="typo-overline text-sm mb-4 text-surface-dark-fg/70">
              Journeys
            </p>
            <h2 className="typo-display text-4xl md:text-5xl text-surface-dark-fg">
              探索旅程
            </h2>
          </div>
          <Button
            theme="link"
            href="/journeys"
            className="text-surface-dark-fg/70 hover:text-surface-dark-fg"
          >
            探索更多 →
          </Button>
        </div>
        <div ref={trackRef} className="flex gap-6 px-6 md:px-12 w-fit">
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
