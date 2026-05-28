import { notFound } from "next/navigation";
import { Suspense } from "react";

import EventsTemplate from "@/components/pages/events/EventsTemplate";
import type { PageProps } from "@/lib/i18n";
import { isValidLocale } from "@/lib/i18n";
import { getSupabase } from "@/lib/supabase/client";
import type { EventRow, EventTypeRow } from "@/lib/types/database";
import { toEventListingItem } from "@/lib/types/database";

const EventsPage = async (props: PageProps) => {
  const { locale } = await props.params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const [eventsResult, typesResult] = await Promise.all([
    getSupabase()
      .from("events")
      .select("*")
      .eq("status", "open")
      .order("start_date", { ascending: true }),
    getSupabase().from("event_types").select("*"),
  ]);

  const typeMap = new Map(
    ((typesResult.data ?? []) as EventTypeRow[]).map((t) => [
      t.slug,
      { name_zh: t.name_zh, name_en: t.name_en },
    ])
  );

  const events =
    (eventsResult.data as EventRow[] | null)?.map((row) =>
      toEventListingItem(row, typeMap)
    ) ?? [];

  return (
    <Suspense>
      <EventsTemplate events={events} />
    </Suspense>
  );
};

EventsPage.displayName = "EventsPage";
export default EventsPage;
