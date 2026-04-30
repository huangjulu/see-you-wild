import { notFound } from "next/navigation";
import { Suspense } from "react";

import EventsTemplate from "@/components/pages/events/EventsTemplate";
import type { PageProps } from "@/lib/i18n";
import { isValidLocale } from "@/lib/i18n";

const EventsPage: React.FC<PageProps> = async (props) => {
  const { locale } = await props.params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <Suspense>
      <EventsTemplate />
    </Suspense>
  );
};

EventsPage.displayName = "EventsPage";
export default EventsPage;
