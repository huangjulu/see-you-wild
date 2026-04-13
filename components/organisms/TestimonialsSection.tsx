"use client";

import React, { useRef } from "react";
import { useScrollReveal } from "@/lib/gsap";
import TestimonialCard from "@/components/molecules/TestimonialCard";

const TestimonialsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useScrollReveal(sectionRef, {
    selector: ".testimonial-card",
    from: { opacity: 0, y: 40 },
    to: {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        start: "top 80%",
        toggleActions: "play none none none",
      },
    },
  });

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 px-6 md:px-12 bg-primary-100"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="typo-overline text-sm mb-4 text-muted-warm">
            Testimonials
          </p>
          <h2 className="typo-display text-4xl md:text-5xl text-foreground">
            旅人心聲
          </h2>
        </div>
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
          {TESTIMONIALS.map((testimonial) => (
            <TestimonialCard
              key={testimonial.author}
              quote={testimonial.quote}
              author={testimonial.author}
              trip={testimonial.trip}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

TestimonialsSection.displayName = "TestimonialsSection";
export default TestimonialsSection;

const TESTIMONIALS = [
  {
    quote: "在野溪溫泉裡仰望星空的那一刻，我覺得這才是人生該有的樣子。",
    author: "Ava L.",
    trip: "野溪溫泉秘境團",
  },
  {
    quote:
      "私廚的料理在大自然裡吃起來特別不同，每一口都是幸福。團隊把每個細節都照顧得很好，完全不用擔心。",
    author: "James K.",
    trip: "星空野營私廚",
  },
  {
    quote: "SUP 在日出時分划出去，海面像鏡子一樣。這是我體驗過最平靜的時刻。",
    author: "Mei W.",
    trip: "SUP 立槳日出團",
  },
  {
    quote: "攀樹讓我用全新的視角看森林，樹冠層的世界太令人驚嘆了。",
    author: "Chris T.",
    trip: "攀樹森林浴",
  },
  {
    quote:
      "原本以為只是普通的露營，結果是一場完整的五感體驗。已經預約下一團了！",
    author: "Sophie C.",
    trip: "野營私廚體驗",
  },
  {
    quote: "溯溪的過程有挑戰也有驚喜，教練非常專業，讓我們安心享受每一刻。",
    author: "David H.",
    trip: "溯溪探險團",
  },
];
