"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/stores/motion";
import Button from "@/components/atoms/Button";

interface CTACardProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}

const MAX_TILT = 6;

const CTACard: React.FC<CTACardProps> = (props) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(
    function mouseTilt() {
      if (reduceMotion) return;
      const card = cardRef.current;
      if (!card) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;

      const rotX = gsap.quickTo(card, "rotationX", {
        duration: 0.4,
        ease: "power2.out",
      });
      const rotY = gsap.quickTo(card, "rotationY", {
        duration: 0.4,
        ease: "power2.out",
      });

      const handleMove = (e: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        rotY(nx * MAX_TILT * 2);
        rotX(-ny * MAX_TILT * 2);
      };
      const handleLeave = () => {
        rotX(0);
        rotY(0);
      };

      card.addEventListener("pointermove", handleMove);
      card.addEventListener("pointerleave", handleLeave);

      return () => {
        card.removeEventListener("pointermove", handleMove);
        card.removeEventListener("pointerleave", handleLeave);
      };
    },
    [reduceMotion]
  );

  return (
    <div className="perspective-[1000px]">
      <div
        ref={cardRef}
        className="flex flex-col md:flex-row min-h-137.5 bg-surface-warm overflow-hidden shadow-2xl rounded-2xl will-change-transform transition-shadow duration-300 hover:shadow-[0_30px_60px_-15px_rgba(45,58,64,0.25)]"
      >
        <div className="md:w-1/2 relative h-87.5 md:h-auto overflow-hidden">
          <img
            src={props.imageSrc}
            alt={props.imageAlt}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="md:w-1/2 flex flex-col justify-center items-center md:items-start p-8 md:p-24 text-center md:text-left">
          <h2 className="typo-display text-5xl md:text-7xl text-foreground mb-8 leading-tight lowercase">
            {props.title}
          </h2>
          <p className="typo-body text-base md:text-lg text-muted mb-12 max-w-sm leading-relaxed font-light">
            {props.description}
          </p>
          <Button
            theme="base"
            href={props.buttonHref}
            className="tracking-[0.3em] uppercase border-foreground text-foreground hover:bg-foreground hover:text-surface-warm"
          >
            {props.buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

CTACard.displayName = "CTACard";
export default CTACard;
