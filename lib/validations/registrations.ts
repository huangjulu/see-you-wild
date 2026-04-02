import { z } from "zod";

const baseRegistrationSchema = z.object({
  event_id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  line_id: z.string().nullable().default(null),
  gender: z.enum(["male", "female", "other"]),
  id_number: z.string().min(1),
  birthday: z.string().date(),
  emergency_contact_name: z.string().min(1),
  emergency_contact_phone: z.string().min(1),
  dietary: z.enum(["omnivore", "no_beef", "vegetarian", "vegan"]),
  wants_rental: z.boolean().default(false),
  notes: z.string().nullable().default(null),
  transport: z.enum(["self", "carpool"]),
  pickup_location: z.string().nullable().default(null),
  carpool_role: z.enum(["passenger", "driver"]).nullable().default(null),
  seat_count: z.number().int().min(3).max(5).nullable().default(null),
});

export const createRegistrationSchema = baseRegistrationSchema
  .refine(
    (data) => {
      if (data.transport === "self") {
        return !data.pickup_location && !data.carpool_role && !data.seat_count;
      }
      return data.pickup_location && data.carpool_role;
    },
    { message: "Carpool fields required when transport is 'carpool'" }
  )
  .refine(
    (data) => {
      if (data.carpool_role === "driver") {
        return data.seat_count !== null;
      }
      return true;
    },
    { message: "seat_count required for drivers" }
  );

export const updateRegistrationSchema = baseRegistrationSchema
  .partial()
  .extend({
    status: z.enum(["pending", "paid"]).optional(),
  });

export const paymentRefSchema = z.object({
  payment_ref: z
    .string()
    .length(5)
    .regex(/^\d{5}$/, "Must be 5 digits"),
  token: z.string().min(1),
});

export type CreateRegistrationInput = z.infer<typeof baseRegistrationSchema>;
export type UpdateRegistrationInput = z.infer<typeof updateRegistrationSchema>;
export type PaymentRefInput = z.infer<typeof paymentRefSchema>;
