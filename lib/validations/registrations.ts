import { z } from "zod";

import {
  calculateAge,
  COUNTRY_ISO_CODES,
  E164_REGEX,
  isValidTwId,
  LINE_ID_REGEX,
  MAX_LENGTHS,
  PASSPORT_REGEX,
  TW_ID_REGEX,
} from "@/lib/form-rules";

// Trim/lowercase/uppercase happen *before* min(1) so whitespace-only inputs fail validation,
// and DB rows are stored in canonical form (matches the functional unique index on lower(email)).
const baseRegistrationSchema = z.object({
  event_id: z.string().min(1),
  country: z.enum(COUNTRY_ISO_CODES),
  name: z.string().trim().min(1).max(MAX_LENGTHS.name),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().regex(E164_REGEX, "invalidPhone"),
  line_id: z
    .union([
      z.literal("").transform(() => null),
      z
        .string()
        .trim()
        .max(MAX_LENGTHS.line_id, "lineIdInvalid")
        .regex(LINE_ID_REGEX, "lineIdInvalid"),
      z.null(),
    ])
    .default(null),
  gender: z.enum(["male", "female", "other"]).default("male"),
  id_number: z.string().trim().toUpperCase().min(1),
  birthday: z
    .string()
    .date()
    .refine(
      (value) => {
        const d = new Date(value);
        const today = new Date();
        const min = new Date("1900-01-01");
        return d >= min && d <= today;
      },
      { message: "invalidBirthday" }
    ),
  emergency_contact_name: z
    .string()
    .trim()
    .min(1)
    .max(MAX_LENGTHS.emergency_contact_name),
  emergency_contact_phone: z.string().trim().regex(E164_REGEX, "invalidPhone"),
  dietary: z.enum(["omnivore", "no_beef", "vegetarian", "vegan"]),
  wants_rental: z.boolean().default(false),
  notes: z
    .string()
    .trim()
    .max(MAX_LENGTHS.notes, "notesTooLong")
    .nullable()
    .default(null),
  transport: z.enum(["self", "carpool"]),
  pickup_location: z
    .enum(["taipei", "nangang", "dapinglin", "sanchong", "banqiao"])
    .nullable()
    .default(null),
  carpool_role: z.enum(["passenger", "driver"]).nullable().default(null),
  seat_count: z.number().int().min(3).max(5).nullable().default(null),
  guardian_consent: z.boolean().nullable().default(null),
});

type BaseRegistrationData = z.infer<typeof baseRegistrationSchema>;

function addCarpoolIssues(
  data: Pick<
    BaseRegistrationData,
    "transport" | "pickup_location" | "carpool_role" | "seat_count"
  >,
  ctx: z.RefinementCtx
): void {
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

function addIdNumberIssue(
  data: Pick<BaseRegistrationData, "country" | "id_number">,
  ctx: z.RefinementCtx
): void {
  if (data.country === "TW") {
    if (!TW_ID_REGEX.test(data.id_number)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "invalidTwId",
        path: ["id_number"],
      });
      return;
    }
    if (!isValidTwId(data.id_number)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "invalidTwIdChecksum",
        path: ["id_number"],
      });
    }
    return;
  }

  if (!PASSPORT_REGEX.test(data.id_number)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "invalidPassport",
      path: ["id_number"],
    });
  }
}

function addGuardianConsentIssue(
  data: Pick<BaseRegistrationData, "birthday" | "guardian_consent">,
  ctx: z.RefinementCtx
): void {
  if (!data.birthday) return;
  const age = calculateAge(data.birthday);
  if (Number.isNaN(age)) return;
  if (age < 18 && data.guardian_consent !== true) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "guardianConsentRequired",
      path: ["guardian_consent"],
    });
  }
}

type RegistrationRefinementData = Omit<BaseRegistrationData, "event_id">;

function applyRegistrationRefinements(
  data: RegistrationRefinementData,
  ctx: z.RefinementCtx
): void {
  addCarpoolIssues(data, ctx);
  addIdNumberIssue(data, ctx);
  addGuardianConsentIssue(data, ctx);
}

export const registrationFormSchema = baseRegistrationSchema
  .omit({ event_id: true })
  .superRefine(applyRegistrationRefinements);

export const createRegistrationSchema = baseRegistrationSchema.superRefine(
  applyRegistrationRefinements
);

export const updateRegistrationSchema = baseRegistrationSchema
  .partial()
  .extend({
    status: z.enum(["pending", "paid", "failed"]).optional(),
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
      case "too_big":
        if (issue.path?.[issue.path.length - 1] === "name") {
          return { message: t("nameTooLong") };
        }
        if (issue.path?.[issue.path.length - 1] === "emergency_contact_name") {
          return { message: t("nameTooLong") };
        }
        if (issue.path?.[issue.path.length - 1] === "notes") {
          return { message: t("notesTooLong") };
        }
        if (issue.path?.[issue.path.length - 1] === "line_id") {
          return { message: t("lineIdInvalid") };
        }
        return { message: t("invalidFormat") };
      case "invalid_format":
        if (issue.format === "email") return { message: t("invalidEmail") };
        if (issue.format === "regex") {
          if (
            issue.path?.[issue.path.length - 1] === "phone" ||
            issue.path?.[issue.path.length - 1] === "emergency_contact_phone"
          ) {
            return { message: t("invalidPhone") };
          }
          if (issue.path?.[issue.path.length - 1] === "line_id") {
            return { message: t("lineIdInvalid") };
          }
        }
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
