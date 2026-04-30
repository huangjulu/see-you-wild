import { notFound } from "next/navigation";
import type React from "react";

import EventDetailTemplate from "@/components/pages/event-detail/EventDetailTemplate";
import { MOCK_EVENTS } from "@/server/mockdata/mock-events";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

const EventDetailPage: React.FC<PageProps> = async (props) => {
  const { id } = await props.params;
  const event = MOCK_EVENTS.find((e) => e.id === id);

  if (event == null) {
    notFound();
  }

  return <EventDetailTemplate event={event} />;
};

EventDetailPage.displayName = "EventDetailPage";
export default EventDetailPage;
