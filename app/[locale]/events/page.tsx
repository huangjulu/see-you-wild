import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n";
import type { PageProps } from "@/lib/i18n";
import EventsTemplate from "@/components/pages/events/EventsTemplate";

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
