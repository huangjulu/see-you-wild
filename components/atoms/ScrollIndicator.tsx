"use client";

export default function ScrollIndicator() {
  return (
    <button
      onClick={() => {
        document.getElementById("events")?.scrollIntoView({ behavior: "smooth" });
      }}
      className="animate-bounce-slow text-white/60 hover:text-white transition-colors"
      aria-label="Scroll down to events"
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 13l5 5 5-5" />
        <path d="M7 6l5 5 5-5" />
      </svg>
    </button>
  );
}
