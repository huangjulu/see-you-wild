import { z } from "zod";

export const contactFormSchema = z.object({
  template: z.enum(["group4", "private", "custom"]),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().default(""),
  activityType: z.string().optional().default(""),
  groupSize: z.string().optional().default(""),
  preferredDate: z.string().optional().default(""),
  duration: z.string().optional().default(""),
  message: z.string().optional().default(""),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
