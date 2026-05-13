import { notFound } from "next/navigation";
import type React from "react";

import EventDetailTemplate from "@/components/pages/event-detail/EventDetailTemplate";
import { getSupabase } from "@/lib/supabase/client";
import type { EventRow } from "@/lib/types/database";
import { toEventDetail } from "@/lib/types/database";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

const EventDetailPage: React.FC<PageProps> = async (props) => {
  const { id } = await props.params;
  const { data } = await getSupabase()
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("status", "open")
    .single();

  if (data == null) {
    notFound();
  }

  // Supabase client returns a generic type; EventRow is manually maintained to match the DB schema
  const event = toEventDetail(data as EventRow);

  return <EventDetailTemplate event={event} />;
};

EventDetailPage.displayName = "EventDetailPage";
export default EventDetailPage;
