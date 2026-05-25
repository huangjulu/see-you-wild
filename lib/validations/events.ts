import { z } from "zod";

export const createEventSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  location: z.string().min(1),
  title: z.string().min(1),
  start_date: z.string().date(),
  end_date: z.string().date(),
  base_price: z.number().int().positive(),
  carpool_surcharge: z.number().int().positive(),
  driver_refund_per_passenger: z.number().int().min(0).default(0),
  payment_days: z.number().int().positive(),
  carpool_cutoff_days: z.number().int().min(0).default(3),
  min_participants: z.number().int().min(1).default(3),
  description: z.string().default(""),
  pickup_locations: z.array(z.string()).default([]),
  images: z
    .array(z.object({ src: z.string().url(), alt: z.string() }))
    .default([]),
  available_dates: z.array(z.string().date()).min(1),
  safety_policy: z.string().default(""),
  preparation_notes: z.string().max(500).default(""),
  faq: z.string().max(1000).default(""),
  refund_policy: z.string().max(1000).default(""),
  status: z.enum(["open", "closed"]).default("open"),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = z.object({
  type: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  base_price: z.number().int().positive().optional(),
  carpool_surcharge: z.number().int().positive().optional(),
  driver_refund_per_passenger: z.number().int().min(0).optional(),
  payment_days: z.number().int().positive().optional(),
  carpool_cutoff_days: z.number().int().min(0).optional(),
  min_participants: z.number().int().min(1).optional(),
  description: z.string().optional(),
  pickup_locations: z.array(z.string()).optional(),
  images: z
    .array(z.object({ src: z.string().url(), alt: z.string() }))
    .optional(),
  available_dates: z.array(z.string().date()).optional(),
  safety_policy: z.string().optional(),
  preparation_notes: z.string().max(500).optional(),
  faq: z.string().max(1000).optional(),
  refund_policy: z.string().max(1000).optional(),
  status: z.enum(["open", "closed"]).optional(),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const deleteEventSchema = z.object({
  cancellation_reason: z.string().min(1),
});

export type DeleteEventInput = z.infer<typeof deleteEventSchema>;
