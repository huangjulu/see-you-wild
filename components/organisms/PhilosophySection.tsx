"use client";

import React, { useRef } from "react";
import { useTranslations } from "@/lib/i18n/client";
import { useTween } from "@/lib/gsap";

const PhilosophySection: React.FC = () => {
  const t = useTranslations("home.philosophy");
  const sectionRef = useRef<HTMLElement>(null);

  useTween(sectionRef, {
    selector: ".reveal-up",
    from: { opacity: 0, y: 40 },
    to: {
      opacity: 1,
      y: 0,
      duration: 1.3,
      ease: "power3.out",
      scrollTrigger: {
        start: "top 88%",
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
              src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80"
              alt={t("imageAlt")}
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
