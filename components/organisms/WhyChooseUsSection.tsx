"use client";

import React, { useRef } from "react";
import {
  Shield as IconShield,
  Mountain as IconMountain,
  Sparkles as IconSparkles,
} from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";
import { useTween } from "@/lib/gsap";

const VALUE_KEYS = ["safety", "experience", "quality"] as const;
const VALUE_ICONS = [IconShield, IconMountain, IconSparkles];

const WhyChooseUsSection: React.FC = () => {
  const t = useTranslations("home.whyChooseUs");
  const sectionRef = useRef<HTMLElement>(null);

  useTween(sectionRef, {
    selector: ".why-item",
    from: { opacity: 0, y: 50 },
    to: {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "[data-reveal-trigger]",
        start: "top 60%",
        toggleActions: "play none none none",
      },
    },
  });

  return (
    <section
      ref={sectionRef}
      className="pt-24 pb-28 md:py-32 px-6 md:px-12 bg-background"
    >
      <div data-reveal-trigger className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="why-item typo-overline text-sm mb-4 text-muted-warm">
            {t("overline")}
          </p>
          <h2 className="why-item typo-display text-4xl md:text-5xl text-foreground">
            {t("title")}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {VALUE_KEYS.map((key, i) => {
            const Icon = VALUE_ICONS[i];
            return (
              <div
                key={key}
                className="why-item flex flex-col items-center text-center space-y-4"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-primary-100">
                  <Icon className="size-6 text-accent" />
                </div>
                <h3 className="typo-sub-heading text-xl text-foreground">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="typo-body text-base leading-relaxed text-foreground/70">
                  {t(`items.${key}.desc`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

WhyChooseUsSection.displayName = "WhyChooseUsSection";
export default WhyChooseUsSection;
