import { z } from "zod";

// slug 進 URL 與 events.type 關聯，鎖 kebab-case；值來源參照 lib/utils/slug.ts toSlug 輸出
export const eventTypeSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Must be kebab-case"),
  name_zh: z.string().trim().min(1),
  name_en: z.string().trim().min(1),
});

export type EventTypeInput = z.input<typeof eventTypeSchema>;
