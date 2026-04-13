"use client";

import React, { useRef } from "react";
import {
  Shield as IconShield,
  Mountain as IconMountain,
  Sparkles as IconSparkles,
} from "lucide-react";
import { useScrollReveal } from "@/lib/gsap";

const WhyChooseUsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useScrollReveal(sectionRef, {
    selector: ".why-item",
    from: { opacity: 0, y: 50 },
    to: {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        start: "top 75%",
        toggleActions: "play none none none",
      },
    },
  });

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 px-6 md:px-12 bg-background"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="typo-overline text-sm mb-4 text-muted-warm">
            Why Choose Us
          </p>
          <h2 className="typo-display text-4xl md:text-5xl text-foreground">
            為什麼選擇我們
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {VALUES.map((item) => (
            <div
              key={item.title}
              className="why-item flex flex-col items-center text-center space-y-4"
            >
              <div className="flex size-14 items-center justify-center rounded-full bg-primary-100">
                <item.icon className="size-6 text-accent" />
              </div>
              <h3 className="typo-sub-heading text-xl text-foreground">
                {item.title}
              </h3>
              <p className="typo-body text-base leading-relaxed text-foreground/70">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

WhyChooseUsSection.displayName = "WhyChooseUsSection";
export default WhyChooseUsSection;

const VALUES = [
  {
    icon: IconShield,
    title: "安全至上",
    desc: "每位嚮導均持有專業證照，定期訓練與裝備檢修，讓妳安心享受每一刻。",
  },
  {
    icon: IconMountain,
    title: "深度體驗",
    desc: "我們不走觀光路線，每條路線都經過實地探勘，帶妳看見台灣最原始的美。",
  },
  {
    icon: IconSparkles,
    title: "質感細節",
    desc: "從行前準備到活動後的照片紀錄，每個環節都為妳精心打磨，留下值得珍藏的記憶。",
  },
];
