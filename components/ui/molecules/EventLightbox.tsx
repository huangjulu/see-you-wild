"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  X as IconX,
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
} from "lucide-react";

interface EventLightboxProps {
  images: { src: string; alt: string }[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EventLightbox: React.FC<EventLightboxProps> = (props) => {
  const [currentIndex, setCurrentIndex] = useState(props.initialIndex ?? 0);

  useEffect(
    function syncIndex() {
      if (props.open) {
        setCurrentIndex(props.initialIndex ?? 0);
      }
    },
    [props.open, props.initialIndex]
  );

  const goNext = useCallback(
    function goNext() {
      setCurrentIndex((i) => (i + 1) % props.images.length);
    },
    [props.images.length]
  );

  const goPrev = useCallback(
    function goPrev() {
      setCurrentIndex(
        (i) => (i - 1 + props.images.length) % props.images.length
      );
    },
    [props.images.length]
  );

  useEffect(
    function handleKeyboard() {
      if (!props.open) return;
      function onKeyDown(e: KeyboardEvent) {
        if (e.key === "ArrowRight") goNext();
        else if (e.key === "ArrowLeft") goPrev();
        else if (e.key === "Escape") props.onOpenChange(false);
      }
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    },
    [props.open, goNext, goPrev, props.onOpenChange]
  );

  if (!props.open) return null;

  const current = props.images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={function onBackdrop() {
        props.onOpenChange(false);
      }}
    >
      <button
        type="button"
        className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        onClick={function onClose(e) {
          e.stopPropagation();
          props.onOpenChange(false);
        }}
      >
        <IconX className="size-6" />
      </button>

      {props.images.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={function onPrev(e) {
              e.stopPropagation();
              goPrev();
            }}
          >
            <IconChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            className="absolute right-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={function onNext(e) {
              e.stopPropagation();
              goNext();
            }}
          >
            <IconChevronRight className="size-6" />
          </button>
        </>
      )}

      <img
        src={current.src}
        alt={current.alt}
        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
        onClick={function stopPropagation(e) {
          e.stopPropagation();
        }}
      />

      {props.images.length > 1 && (
        <div className="absolute bottom-6 flex gap-2">
          {props.images.map((_, i) => (
            <button
              key={i}
              type="button"
              className={cn(
                "size-2 rounded-full transition-colors",
                i === currentIndex ? "bg-white" : "bg-white/40"
              )}
              onClick={function goToIndex(e) {
                e.stopPropagation();
                setCurrentIndex(i);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

EventLightbox.displayName = "EventLightbox";
export default EventLightbox;
