"use client";

import { useRef } from "react";

import Heading from "@/components/ui/atoms/Heading";
import { useTween } from "@/lib/gsap";
import { useTranslations } from "@/lib/i18n/client";

const VALUE_KEYS = ["joy", "vacation", "guidance"] as const;
const VALUE_IMAGES = [
  "/images/why-choose-us/joy.webp",
  "/images/why-choose-us/vacation.webp",
  "/images/why-choose-us/guidance.webp",
];

const WhyChooseUsSection = () => {
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
      className="relative -mt-px pt-24 pb-28 md:py-32 px-8 md:px-16 bg-background"
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
          {VALUE_KEYS.map((key, i) => (
            <div key={key} className="why-item flex flex-col space-y-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <img
                  src={VALUE_IMAGES[i]}
                  alt={t(`items.${key}.title`)}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <Heading.H3
                variant="sub-heading"
                description={t(`items.${key}.desc`)}
                descriptionClassName="text-base leading-relaxed text-primary/70"
              >
                {t(`items.${key}.title`)}
              </Heading.H3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

WhyChooseUsSection.displayName = "WhyChooseUsSection";
export default WhyChooseUsSection;
