"use client";

import React, { useRef } from "react";
import { useScrollReveal } from "@/lib/gsap";

const PhilosophySection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useScrollReveal(sectionRef, {
    selector: ".reveal-up",
    from: { opacity: 0, y: 60 },
    to: {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        start: "top 85%",
        toggleActions: "play none none none",
      },
    },
  });

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-24 md:py-32 px-6 md:px-12 bg-background"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
        <div className="space-y-8">
          <p className="reveal-up gsap-reveal typo-overline text-sm text-muted-warm">
            Our Philosophy
          </p>
          <h2 className="reveal-up gsap-reveal typo-display text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground">
            在自然中，
            <br />
            找到真實的自己。
          </h2>
          <p className="reveal-up gsap-reveal typo-body text-lg leading-relaxed text-foreground/70">
            我們相信，最深刻的體驗來自山林與海洋之間。每一趟旅程都是一次與自然的對話，在遼闊的天地間，卸下城市的枷鎖，重新感受生命的律動。
          </p>
          <p className="reveal-up gsap-reveal typo-body text-lg leading-relaxed text-foreground/70">
            See You Wild
            不只是戶外探險，而是一場靈魂的撒野。我們精心策劃每一個細節，讓你在野性與優雅之間，找到屬於自己的節奏。
          </p>
        </div>
        <div className="reveal-up gsap-reveal">
          <div className="relative rounded-2xl overflow-hidden aspect-[3/4]">
            <img
              src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80"
              alt="Nature philosophy"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

PhilosophySection.displayName = "PhilosophySection";
export default PhilosophySection;
