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
  images: z.array(z.string().url()).default([]),
  available_dates: z.array(z.string().date()).min(1),
  safety_policy: z.string().default(""),
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
  images: z.array(z.string().url()).optional(),
  available_dates: z.array(z.string().date()).optional(),
  safety_policy: z.string().optional(),
  status: z.enum(["open", "closed"]).optional(),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const deleteEventSchema = z.object({
  cancellation_reason: z.string().min(1),
});

export type DeleteEventInput = z.infer<typeof deleteEventSchema>;
