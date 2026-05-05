"use client";

import React, { useState } from "react";

import EventDetailSection from "@/components/pages/event-detail/EventDetailSection";
import EventGallery from "@/components/pages/event-detail/EventGallery";
import EventPriceSidebar from "@/components/pages/event-detail/EventPriceSidebar";
import PackageOptions from "@/components/pages/event-detail/PackageOptions";
import type { PackageSelection } from "@/components/pages/event-detail/packageOptions.types";
import Section from "@/components/ui/atoms/Section";
import RegistrationModal from "@/components/ui/organisms/RegistrationModal";
import { useTranslations } from "@/lib/i18n/client";
import type { MockEventDetail } from "@/server/mockdata/mock-events";

interface EventDetailTemplateProps {
  event: MockEventDetail;
}

const EventDetailTemplate: React.FC<EventDetailTemplateProps> = (props) => {
  const t = useTranslations("eventDetail");
  const event = props.event;

  const [selection, setSelection] = useState<PackageSelection>({
    selectedDate: null,
    transport: "self",
    carpoolRole: null,
    selectedPickup: null,
    seatCount: null,
  });

  const [modalOpen, setModalOpen] = useState(false);

  const allOptionsSelected =
    selection.selectedDate !== null &&
    (selection.transport === "self" || selection.selectedPickup !== null);

  function onBookClick() {
    setModalOpen(true);
  }

  return (
    <main className="bg-linear-180 md:bg-radial-[at_top_left] from-brand-100 from-20% via-40% via-cyan-50 to-surface to-80% pb-24 md:pb-16">
      {/* Title + description */}
      <Section as="div" className="pt-24 md:pt-28">
        <h1 className="col-span-full typo-heading text-3xl md:text-4xl text-primary mb-2">
          {event.title}
        </h1>
        <p className="col-span-full typo-body text-sm text-secondary">
          {event.location} · {event.start_date}
          {event.end_date !== event.start_date && ` — ${event.end_date}`}
        </p>
      </Section>

      {/* Gallery */}
      <Section as="div" className="mt-4">
        <EventGallery className="col-span-full" images={event.images} />
      </Section>

      {/* Content + Sidebar */}
      <Section as="div" className="mt-8">
        {/* Left column */}
        <div className="col-span-4 md:col-span-5 lg:col-span-8 space-y-6">
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
        <div className="col-span-4 md:col-span-3 lg:col-span-4">
          <EventPriceSidebar
            basePrice={event.base_price}
            carpoolSurcharge={event.carpoolSurcharge}
            isSelfArrival={selection.transport === "self"}
            allOptionsSelected={allOptionsSelected}
            selectedDate={selection.selectedDate}
            onBook={onBookClick}
          />
        </div>
      </Section>

      <RegistrationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        eventId={event.id}
        basePrice={event.base_price}
        carpoolSurcharge={event.carpoolSurcharge}
        selectedDate={selection.selectedDate}
        selectedPickup={selection.selectedPickup}
        isSelfArrival={selection.transport === "self"}
        pickupLocations={event.pickupLocations}
      />
    </main>
  );
};

EventDetailTemplate.displayName = "EventDetailTemplate";
export default EventDetailTemplate;
