"use client";

import React, { useState } from "react";

import EventDetailSection from "@/components/pages/event-detail/EventDetailSection";
import EventGallery from "@/components/pages/event-detail/EventGallery";
import EventPriceSidebar from "@/components/pages/event-detail/EventPriceSidebar";
import PackageOptions from "@/components/pages/event-detail/PackageOptions";
import type { PackageSelection } from "@/components/pages/event-detail/packageOptions.types";
import Heading from "@/components/ui/atoms/Heading";
import Section from "@/components/ui/atoms/Section";
import RegistrationModal from "@/components/ui/organisms/RegistrationModal";
import { useTranslations } from "@/lib/i18n/client";
import type { EventDetailDto } from "@/lib/types/database";

interface EventDetailTemplateProps {
  event: EventDetailDto;
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
    <main className="bg-page-gradient pb-24 md:pb-16">
      {/* Title + description */}
      <Section as="div" className="pt-24 md:pt-28">
        <Heading.H1
          className="col-span-full text-3xl md:text-4xl"
          description={`${event.location} · ${event.startDate}${event.endDate !== event.startDate ? ` — ${event.endDate}` : ""}`}
          descriptionClassName="text-sm"
        >
          {event.title}
        </Heading.H1>
      </Section>

      {/* Gallery */}
      <Section as="div" className="mt-4">
        <EventGallery className="col-span-full" images={event.images} />
      </Section>

      {/* Content + Sidebar */}
      <Section as="div" className="mt-8">
        {/* Left column */}
        <div className="col-span-4 md:col-span-5 lg:col-span-8 space-y-5">
          {event.description !== "" && (
            <EventDetailSection
              title={t("eventDetails")}
              content={event.description}
              expandLabel={t("viewDetails")}
              collapseLabel={t("collapse")}
            />
          )}

          <PackageOptions
            availableDates={event.availableDates}
            pickupLocations={event.pickupLocations}
            carpoolSurcharge={event.carpoolSurcharge}
            onSelectionChange={setSelection}
          />

          {event.safetyPolicy !== "" && (
            <EventDetailSection
              title={t("safetyPolicy")}
              content={event.safetyPolicy}
              expandLabel={t("viewPolicy")}
              collapseLabel={t("collapse")}
            />
          )}
        </div>

        {/* Right column: Price Sidebar */}
        <div className="col-span-4 md:col-span-3 lg:col-span-4">
          <EventPriceSidebar
            basePrice={event.basePrice}
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
        eventTitle={event.title}
        eventLocation={event.location}
        eventDate={event.startDate}
        basePrice={event.basePrice}
        carpoolSurcharge={event.carpoolSurcharge}
        selectedDate={selection.selectedDate}
        selectedPickup={selection.selectedPickup}
        isSelfArrival={selection.transport === "self"}
        carpoolRole={selection.carpoolRole}
        seatCount={selection.seatCount}
        pickupLocations={event.pickupLocations}
        paymentDays={event.paymentDays}
      />
    </main>
  );
};

EventDetailTemplate.displayName = "EventDetailTemplate";
export default EventDetailTemplate;
