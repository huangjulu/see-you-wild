"use client";

import {
  Mountain as IconMountain,
  Shield as IconShield,
  Sparkles as IconSparkles,
} from "lucide-react";
import React, { useRef } from "react";

import Heading from "@/components/ui/atoms/Heading";
import { useTween } from "@/lib/gsap";
import { useTranslations } from "@/lib/i18n/client";

const VALUE_KEYS = ["safety", "experience", "quality"] as const;
const VALUE_ICONS = [IconShield, IconMountain, IconSparkles];

const WhyChooseUsSection: React.FC = () => {
  const t = useTranslations("home.whyChooseUs");
  const sectionRef = useRef<HTMLElement>(null);
  const revealTriggerRef = useRef<HTMLDivElement>(null);

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
        trigger: revealTriggerRef,
        start: "top 60%",
        toggleActions: "play none none none",
      },
    },
  });

  return (
    <section
      ref={sectionRef}
      className="pt-24 pb-28 md:py-32 px-10 md:px-16 bg-background"
    >
      <div ref={revealTriggerRef} className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Heading.H2
            variant="display"
            overline={t("overline")}
            overlineClassName="why-item mb-4"
            className="why-item"
          >
            {t("title")}
          </Heading.H2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {VALUE_KEYS.map((key, i) => {
            const Icon = VALUE_ICONS[i];
            return (
              <div
                key={key}
                className="why-item flex flex-col items-center text-center space-y-4"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-brand-100">
                  <Icon className="size-6 text-accent" />
                </div>
                <Heading.H3
                  variant="sub-heading"
                  description={t(`items.${key}.desc`)}
                  descriptionClassName="text-base leading-relaxed text-primary/70"
                >
                  {t(`items.${key}.title`)}
                </Heading.H3>
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
