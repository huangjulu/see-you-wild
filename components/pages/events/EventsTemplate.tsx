"use client";

import { useSearchParams } from "next/navigation";
import React from "react";

import Heading from "@/components/ui/atoms/Heading";
import Section from "@/components/ui/atoms/Section";
import EventsGrid from "@/components/ui/molecules/EventsGrid";
import { useTranslations } from "@/lib/i18n/client";
import { MOCK_EVENTS } from "@/server/mockdata/mock-events";

const EventsTemplate: React.FC = () => {
  const t = useTranslations("events");
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") ?? "";
  const initialLocation = searchParams.get("location") ?? "";

  return (
    <main className="bg-background py-16 md:py-24">
      <Section as="div">
        <div className="col-span-full mb-10">
          <p className="typo-overline mb-4 text-sm text-secondary">
            {t("overline")}
          </p>
          <Heading level="h1" className="text-4xl md:text-5xl">
            {t("title")}
          </Heading>
        </div>
        <EventsGrid
          className="col-span-full"
          events={MOCK_EVENTS}
          initialType={initialType}
          initialLocation={initialLocation}
        />
      </Section>
    </main>
  );
};

EventsTemplate.displayName = "EventsTemplate";
export default EventsTemplate;
