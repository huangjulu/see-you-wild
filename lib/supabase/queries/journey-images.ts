import { getSupabase } from "@/lib/supabase/client";

const JOURNEY_TYPES = [
  "river-tracing",
  "sup",
  "yacht",
  "camping",
  "tree-climbing",
  "rafting",
] as const;

const FALLBACK_IMAGES: Record<string, string> = {
  "river-tracing": "/images/journeys/river-tracing.webp",
  sup: "/images/journeys/sup.webp",
  yacht: "/images/journeys/yacht.webp",
  camping: "/images/journeys/camping.webp",
  "tree-climbing": "/images/journeys/tree-climbing.webp",
  rafting: "/images/journeys/rafting.webp",
};

export async function getJourneyImages(): Promise<Record<string, string>> {
  const { data } = await getSupabase()
    .from("events")
    .select("type, images")
    .eq("status", "open")
    .order("start_date", { ascending: true });

  const result: Record<string, string> = { ...FALLBACK_IMAGES };

  if (data) {
    for (const event of data) {
      if (
        JOURNEY_TYPES.includes(event.type as (typeof JOURNEY_TYPES)[number]) &&
        result[event.type] === FALLBACK_IMAGES[event.type] &&
        event.images &&
        Array.isArray(event.images) &&
        event.images.length > 0 &&
        event.images[0].src
      ) {
        result[event.type] = event.images[0].src;
      }
    }
  }

  return result;
}
