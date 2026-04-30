"use client";

import React, { useRef } from "react";

import { useTween } from "@/lib/gsap";
import { useTranslations } from "@/lib/i18n/client";

const PhilosophySection: React.FC = () => {
  const t = useTranslations("home.philosophy");
  const sectionRef = useRef<HTMLElement>(null);
  const revealTriggerRef = useRef<HTMLDivElement>(null);

  useTween(sectionRef, {
    selector: ".reveal-up",
    from: { opacity: 0, y: 40 },
    to: {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: revealTriggerRef,
        start: "top 60%",
        toggleActions: "play none none none",
      },
    },
  });

  useTween(sectionRef, {
    selector: ".philosophy-image",
    from: { yPercent: -20, scale: 1.4 },
    to: {
      yPercent: 20,
      scale: 1.4,
      ease: "power3.out",
      scrollTrigger: {
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    },
  });

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-24 md:py-32 px-6 md:px-12 bg-background"
    >
      <div
        ref={revealTriggerRef}
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center"
      >
        <div className="space-y-8">
          <p className="reveal-up gsap-reveal typo-overline text-sm text-primary-500">
            {t("overline")}
          </p>
          <h2 className="reveal-up gsap-reveal typo-display text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground">
            {t("title")
              .split("\n")
              .map((line, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </React.Fragment>
              ))}
          </h2>
          <p className="reveal-up gsap-reveal typo-body text-lg leading-relaxed text-foreground/70">
            {t("body1")}
          </p>
          <p className="reveal-up gsap-reveal typo-body text-lg leading-relaxed text-foreground/70">
            {t("body2")}
          </p>
        </div>
        <div className="reveal-up gsap-reveal">
          <div className="relative rounded-2xl overflow-hidden aspect-[3/4]">
            <img
              src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1200&q=80"
              alt={t("imageAlt")}
              loading="lazy"
              decoding="async"
              className="philosophy-image absolute inset-0 w-full h-full object-cover will-change-transform"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

PhilosophySection.displayName = "PhilosophySection";
export default PhilosophySection;
