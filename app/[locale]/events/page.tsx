import { notFound } from "next/navigation";
import { Suspense } from "react";

import EventsTemplate from "@/components/pages/events/EventsTemplate";
import type { PageProps } from "@/lib/i18n";
import { isValidLocale } from "@/lib/i18n";
import { getSupabase } from "@/lib/supabase/client";
import type { EventRow } from "@/lib/types/database";
import { toEventListingItem } from "@/lib/types/database";

const EventsPage = async (props: PageProps) => {
  const { locale } = await props.params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const { data } = await getSupabase()
    .from("events")
    .select("*")
    .eq("status", "open")
    .order("start_date", { ascending: true });

  const events = (data as EventRow[] | null)?.map(toEventListingItem) ?? [];

  return (
    <Suspense>
      <EventsTemplate events={events} />
    </Suspense>
  );
};

EventsPage.displayName = "EventsPage";
export default EventsPage;
