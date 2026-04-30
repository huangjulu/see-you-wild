import { z } from "zod";

// Trim/lowercase/uppercase happen *before* min(1) so whitespace-only inputs fail validation,
// and DB rows are stored in canonical form (matches the functional unique index on lower(email)).
const baseRegistrationSchema = z.object({
  event_id: z.string().min(1),
  name: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(1),
  line_id: z.string().trim().nullable().default(null),
  gender: z.enum(["male", "female", "other"]),
  id_number: z.string().trim().toUpperCase().min(1),
  birthday: z.string().date(),
  emergency_contact_name: z.string().trim().min(1),
  emergency_contact_phone: z.string().trim().min(1),
  dietary: z.enum(["omnivore", "no_beef", "vegetarian", "vegan"]),
  wants_rental: z.boolean().default(false),
  notes: z.string().trim().nullable().default(null),
  transport: z.enum(["self", "carpool"]),
  pickup_location: z
    .enum(["taipei", "nangang", "dapinglin", "sanchong", "banqiao"])
    .nullable()
    .default(null),
  carpool_role: z.enum(["passenger", "driver"]).nullable().default(null),
  seat_count: z.number().int().min(3).max(5).nullable().default(null),
});

function addCarpoolIssues(
  data: Pick<
    z.infer<typeof baseRegistrationSchema>,
    "transport" | "pickup_location" | "carpool_role" | "seat_count"
  >,
  ctx: z.RefinementCtx
) {
  if (data.transport !== "carpool") return;

  if (!data.pickup_location) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "carpoolFieldRequired",
      path: ["pickup_location"],
    });
  }
  if (!data.carpool_role) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "carpoolFieldRequired",
      path: ["carpool_role"],
    });
  }
  if (data.carpool_role === "driver" && data.seat_count === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "seatCountRequired",
      path: ["seat_count"],
    });
  }
}

export const registrationFormSchema = baseRegistrationSchema
  .omit({ event_id: true })
  .superRefine(addCarpoolIssues);

export const createRegistrationSchema =
  baseRegistrationSchema.superRefine(addCarpoolIssues);

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
export type RegistrationFormInput = z.infer<typeof registrationFormSchema>;
export type UpdateRegistrationInput = z.infer<typeof updateRegistrationSchema>;
export type PaymentRefInput = z.infer<typeof paymentRefSchema>;

export function createRegistrationErrorMap(
  t: (key: string) => string
): z.ZodErrorMap {
  return (issue) => {
    if (issue.code === "custom") {
      return { message: t(issue.message ?? "required") };
    }
    switch (issue.code) {
      case "too_small":
        return { message: t("required") };
      case "invalid_format":
        if (issue.format === "email") return { message: t("invalidEmail") };
        return { message: t("invalidFormat") };
      case "invalid_type":
        if (issue.expected === "string") return { message: t("required") };
        return undefined;
      case "invalid_value":
        return { message: t("invalidSelection") };
      default:
        return undefined;
    }
  };
}
