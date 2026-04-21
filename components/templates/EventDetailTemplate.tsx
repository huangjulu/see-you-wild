"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "@/lib/i18n/client";

import EventGallery from "@/components/molecules/EventGallery";
import EventDetailSection from "@/components/molecules/EventDetailSection";
import EventPriceSidebar from "@/components/molecules/EventPriceSidebar";
import PackageOptions from "@/components/organisms/PackageOptions";
import type { PackageSelection } from "@/components/organisms/packageOptions.types";
import type { MockEventDetail } from "@/server/mockdata/mock-events";

interface EventDetailTemplateProps {
  event: MockEventDetail;
}

const EventDetailTemplate: React.FC<EventDetailTemplateProps> = (props) => {
  const t = useTranslations("eventDetail");
  const event = props.event;

  const [selection, setSelection] = useState<PackageSelection>({
    selectedDate: null,
    selectedPickup: null,
    isSelfArrival: false,
  });

  // Sentinel: detects when sidebar leaves its natural position (starts sticking)
  const sidebarSentinelRef = useRef<HTMLDivElement>(null);
  const [isSidebarAtOrigin, setIsSidebarAtOrigin] = useState(true);

  useEffect(function observeSidebarSentinel() {
    const el = sidebarSentinelRef.current;
    if (el == null) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSidebarAtOrigin(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const optionsRef = useRef<HTMLDivElement>(null);
  const [isOptionsInView, setIsOptionsInView] = useState(true);

  useEffect(function observeOptions() {
    const el = optionsRef.current;
    if (el == null) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsOptionsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const allOptionsSelected =
    selection.selectedDate !== null &&
    (selection.isSelfArrival || selection.selectedPickup !== null);

  function handleScrollToOptions() {
    optionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleBook() {
    // Placeholder for future registration flow
  }

  return (
    <main className="bg-background pb-24 md:pb-16">
      {/* Title + description — pt-24 clears fixed Header */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 pt-24">
        <h1 className="typo-heading text-3xl md:text-4xl text-foreground mb-2">
          {event.title}
        </h1>
        <p className="typo-body text-sm text-muted">
          {event.location} · {event.start_date}
          {event.end_date !== event.start_date && ` — ${event.end_date}`}
        </p>
      </div>

      {/* Gallery */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 mt-4">
        <EventGallery images={event.images} />
      </div>

      {/* Content + Sidebar */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 mt-8 md:grid md:grid-cols-[1fr_320px] md:gap-8">
        {/* Left column */}
        <div className="space-y-10">
          <EventDetailSection
            title={t("eventDetails")}
            content={event.description}
            expandLabel={t("viewDetails")}
            collapseLabel={t("collapse")}
          />

          <div ref={optionsRef} className="scroll-mt-20">
            <PackageOptions
              availableDates={event.availableDates}
              pickupLocations={event.pickupLocations}
              carpoolSurcharge={event.carpoolSurcharge}
              onSelectionChange={setSelection}
            />
          </div>

          <EventDetailSection
            title={t("safetyPolicy")}
            content={event.safetyPolicy}
            expandLabel={t("viewPolicy")}
            collapseLabel={t("collapse")}
          />
        </div>

        {/* Right column: sentinel + Price Sidebar */}
        <div>
          {/* Sentinel: invisible element at sidebar's natural position.
              When it scrolls out of view, sidebar is "sticking" → CTA switches. */}
          <div ref={sidebarSentinelRef} className="h-0" />
          <EventPriceSidebar
            basePrice={event.base_price}
            carpoolSurcharge={event.carpoolSurcharge}
            isSelfArrival={selection.isSelfArrival}
            allOptionsSelected={allOptionsSelected}
            isSidebarAtOrigin={isSidebarAtOrigin}
            isInView={isOptionsInView}
            onScrollToOptions={handleScrollToOptions}
            onBook={handleBook}
          />
        </div>
      </div>
    </main>
  );
};

EventDetailTemplate.displayName = "EventDetailTemplate";
export default EventDetailTemplate;
