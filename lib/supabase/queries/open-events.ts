import { getSupabase } from "@/lib/supabase/client";
import type { EventRow } from "@/lib/types/database";

export type MenuEvent = Pick<
  EventRow,
  | "id"
  | "title"
  | "location"
  | "start_date"
  | "end_date"
  | "base_price"
  | "images"
>;

// Flex carousel 上限 12 張，留餘裕取 10
export const MENU_EVENT_LIMIT = 10;

export async function getOpenEventsForMenu(): Promise<MenuEvent[]> {
  const { data, error } = await getSupabase()
    .from("events")
    .select("id, title, location, start_date, end_date, base_price, images")
    .eq("status", "open")
    .order("start_date", { ascending: true })
    .limit(MENU_EVENT_LIMIT);

  if (error) {
    console.error("[LINE menu] open events query failed", { code: error.code });
    return [];
  }
  return data ?? [];
}
