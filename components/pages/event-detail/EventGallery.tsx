"use client";

import {
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
} from "lucide-react";
import React, { useCallback, useState } from "react";

import EventLightbox from "@/components/ui/molecules/EventLightbox";
import { cn } from "@/lib/utils";

interface EventGalleryProps {
  images: { src: string; alt: string }[];
}

const EventGallery: React.FC<EventGalleryProps> = (props) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);

  const openLightbox = useCallback(function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const images = props.images;
  if (images.length === 0) return null;

  const main = images[0];
  const side1 = images[1];
  const side2 = images[2];

  return (
    <>
      {/* Desktop: 1 big + 2 small */}
      <div className="hidden md:grid md:grid-cols-3 md:grid-rows-2 gap-1 rounded-2xl overflow-hidden aspect-3/1">
        <button
          type="button"
          className="col-span-2 row-span-2 relative overflow-hidden"
          onClick={function onMainClick() {
            openLightbox(0);
          }}
        >
          <img
            src={main.src}
            alt={main.alt}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </button>
        {side1 != null && (
          <button
            type="button"
            className="relative overflow-hidden"
            onClick={function onSide1Click() {
              openLightbox(1);
            }}
          >
            <img
              src={side1.src}
              alt={side1.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </button>
        )}
        {side2 != null && (
          <button
            type="button"
            className="relative overflow-hidden"
            onClick={function onSide2Click() {
              openLightbox(2);
            }}
          >
            <img
              src={side2.src}
              alt={side2.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </button>
        )}
      </div>

      {/* Mobile: single image carousel (no lightbox) */}
      <div className="relative md:hidden rounded-2xl overflow-hidden aspect-[4/3]">
        <img
          src={images[mobileIndex].src}
          alt={images[mobileIndex].alt}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white"
              onClick={function onMobilePrev() {
                setMobileIndex((i) => (i - 1 + images.length) % images.length);
              }}
            >
              <IconChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white"
              onClick={function onMobileNext() {
                setMobileIndex((i) => (i + 1) % images.length);
              }}
            >
              <IconChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "size-1.5 rounded-full",
                    i === mobileIndex ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <EventLightbox
        images={images}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </>
  );
};

EventGallery.displayName = "EventGallery";
export default EventGallery;
