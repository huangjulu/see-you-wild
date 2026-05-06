"use client";

import React, { useMemo } from "react";

import Heading from "@/components/ui/atoms/Heading";
import Section from "@/components/ui/atoms/Section";
import EventCard from "@/components/ui/molecules/EventCard";
import EventSearchBar from "@/components/ui/molecules/EventSearchBar";
import useEventFilters from "@/lib/hooks/useEventFilters";
import { useTranslations } from "@/lib/i18n/client";

const EventsTemplate: React.FC = () => {
  const t = useTranslations("events");
  const {
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedLocation,
    setSelectedLocation,
    typeOptions,
    locationOptions,
    filteredEvents,
  } = useEventFilters();

  const locationSelectOptions = useMemo(() => {
    return [
      { value: "", label: t("allLocations") },
      ...locationOptions.map((l) => ({ value: l, label: l })),
    ];
  }, [locationOptions, t]);

  return (
    <main className="bg-linear-180 md:bg-radial-[at_top_left] from-brand-100 from-20% via-40% via-cyan-50 to-surface to-80% min-h-screen">
      <div className="sticky z-40 top-0 pb-6 pt-24 sticky-shrink-header sticky-shrink-bg">
        <Section as="div">
          <div className="col-span-full">
            <Heading.H1
              variant="display"
              overline={t("overline")}
              overlineClassName="sticky-shrink-overline"
              className="sticky-shrink-title"
            >
              {t("title")}
            </Heading.H1>
          </div>
          <div className="col-span-full">
            <EventSearchBar
              typeOptions={typeOptions}
              locationOptions={locationSelectOptions}
              selectedType={selectedType}
              selectedLocation={selectedLocation}
              searchQuery={searchQuery}
              onTypeChange={setSelectedType}
              onLocationChange={setSelectedLocation}
              onSearchChange={setSearchQuery}
            />
          </div>
        </Section>
      </div>
      <Section as="div" className="pb-24">
        {filteredEvents.length > 0 ? (
          <div className="col-span-full grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                type={event.type}
                location={event.location}
                title={event.title}
                startDate={event.start_date}
                endDate={event.end_date}
                basePrice={event.base_price}
                status={event.status}
                image={event.image}
                imageAlt={event.imageAlt}
              />
            ))}
          </div>
        ) : (
          <p className="col-span-full typo-body py-12 text-center text-secondary">
            {t("noResults")}
          </p>
        )}
      </Section>
    </main>
  );
};

EventsTemplate.displayName = "EventsTemplate";
export default EventsTemplate;
