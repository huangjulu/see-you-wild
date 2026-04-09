"use client";

import React from "react";
import { ChevronsDown as IconChevronsDown } from "lucide-react";

const ScrollIndicator: React.FC = () => {
  return (
    <button
      onClick={() => {
        document
          .getElementById("events")
          ?.scrollIntoView({ behavior: "smooth" });
      }}
      className="animate-bounce-slow text-white/60 hover:text-white transition-colors"
      aria-label="Scroll down to events"
    >
      <IconChevronsDown size={32} />
    </button>
  );
};

ScrollIndicator.displayName = "ScrollIndicator";
export default ScrollIndicator;
