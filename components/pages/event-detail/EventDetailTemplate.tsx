"use client";

import React, { useState } from "react";
import { useTranslations } from "@/lib/i18n/client";

import EventGallery from "@/components/pages/event-detail/EventGallery";
import EventDetailSection from "@/components/pages/event-detail/EventDetailSection";
import EventPriceSidebar from "@/components/pages/event-detail/EventPriceSidebar";
import PackageOptions from "@/components/pages/event-detail/PackageOptions";
import type { PackageSelection } from "@/components/pages/event-detail/packageOptions.types";
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
    isSelfArrival: true,
  });

  const allOptionsSelected =
    selection.selectedDate !== null &&
    (selection.isSelfArrival || selection.selectedPickup !== null);

  function handleBook() {
    // TODO: Placeholder for future registration flow
  }

  return (
    <main className="bg-linear-180 md:bg-radial-[at_top_left] from-primary-100 from-20% via-40% via-cyan-50 to-surface to-80% pb-24 md:pb-16">
      {/* Title + description — pt-24 clears fixed Header */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 pt-24 md:pt-28">
        <h1 className="typo-heading text-3xl md:text-4xl text-accent-fg mb-2">
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
      <div className="mx-auto max-w-7xl px-6 md:px-12 mt-8 md:grid md:grid-cols-[1fr_320px] md:gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <EventDetailSection
            title={t("eventDetails")}
            content={event.description}
            expandLabel={t("viewDetails")}
            collapseLabel={t("collapse")}
          />

          <PackageOptions
            availableDates={event.availableDates}
            pickupLocations={event.pickupLocations}
            carpoolSurcharge={event.carpoolSurcharge}
            onSelectionChange={setSelection}
          />

          <EventDetailSection
            title={t("safetyPolicy")}
            content={event.safetyPolicy}
            expandLabel={t("viewPolicy")}
            collapseLabel={t("collapse")}
          />
        </div>

        {/* Right column: Price Sidebar */}
        <div>
          <EventPriceSidebar
            basePrice={event.base_price}
            carpoolSurcharge={event.carpoolSurcharge}
            isSelfArrival={selection.isSelfArrival}
            allOptionsSelected={allOptionsSelected}
            selectedDate={selection.selectedDate}
            onBook={handleBook}
          />
        </div>
      </div>
    </main>
  );
};

EventDetailTemplate.displayName = "EventDetailTemplate";
export default EventDetailTemplate;
