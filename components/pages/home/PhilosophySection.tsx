"use client";

import { Fragment, useRef } from "react";

import Heading from "@/components/ui/atoms/Heading";
import { useTween } from "@/lib/gsap";
import { useTranslations } from "@/lib/i18n/client";

const PhilosophySection = () => {
  const t = useTranslations("home.philosophy");
  const sectionRef = useRef<HTMLElement>(null);
  const revealTriggerRef = useRef<HTMLDivElement>(null);
  const logoBadgeRef = useRef<HTMLDivElement>(null);

  useTween(logoBadgeRef, {
    from: { opacity: 0, y: 60 },
    to: {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power3.out",
      scrollTrigger: {
        trigger: revealTriggerRef,
        start: "top 60%",
        toggleActions: "play reverse play reverse",
      },
    },
  });

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

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-24 md:py-32 px-8 md:px-16 bg-background"
    >
      <div
        ref={logoBadgeRef}
        className="md:hidden flex justify-center -mt-36 mb-8 relative z-10"
      >
        <img
          src="/icons/logo-color.png"
          alt="See You Wild 西揪團 logo"
          width={160}
          className="rounded-full bg-background  p-4"
        />
      </div>
      <div
        ref={revealTriggerRef}
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center"
      >
        <div className="space-y-8">
          <p className="reveal-up gsap-reveal typo-overline text-sm text-brand-500">
            {t("overline")}
          </p>
          <Heading.H2
            variant="display"
            className="reveal-up gsap-reveal lg:text-6xl leading-tight"
          >
            {t("title")
              .split("\n")
              .map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </Fragment>
              ))}
          </Heading.H2>
          <p className="reveal-up gsap-reveal typo-body text-lg leading-relaxed text-primary/70">
            {t("body1")}
          </p>
          <p className="reveal-up gsap-reveal typo-body text-lg leading-relaxed text-primary/70">
            {t("body2")}
          </p>
        </div>
        <div className="reveal-up gsap-reveal">
          <div className="relative rounded-2xl overflow-hidden aspect-[3/4]">
            <img
              src="/images/founder-xiaoxi.webp"
              alt={t("imageAlt")}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

PhilosophySection.displayName = "PhilosophySection";
export default PhilosophySection;
