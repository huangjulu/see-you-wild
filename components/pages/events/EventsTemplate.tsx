"use client";

import { useSearchParams } from "next/navigation";
import React from "react";

import Heading from "@/components/ui/atoms/Heading";
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
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-10">
          <p className="typo-overline mb-4 text-sm text-muted">
            {t("overline")}
          </p>
          <Heading level="h1" className="text-4xl md:text-5xl">
            {t("title")}
          </Heading>
        </div>
        <EventsGrid
          events={MOCK_EVENTS}
          initialType={initialType}
          initialLocation={initialLocation}
        />
      </div>
    </main>
  );
};

EventsTemplate.displayName = "EventsTemplate";
export default EventsTemplate;
