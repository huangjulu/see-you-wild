import { z } from "zod";

export const createEventSchema = z
  .object({
    id: z.string().min(1),
    type: z.string().min(1),
    location: z.string().min(1),
    title: z.string().min(1),
    start_date: z.string().date(),
    end_date: z.string().date(),
    base_price: z.number().int().positive(),
    carpool_surcharge: z.number().int().positive(),
    payment_days: z.number().int().positive(),
    min_participants: z.number().int().min(1).default(3),
    status: z.enum(["open", "closed"]).default("open"),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "end_date must be >= start_date",
    path: ["end_date"],
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;
