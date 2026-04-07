import { describe, it, expect } from "vitest";
import {
  createRegistrationSchema,
  paymentRefSchema,
} from "@/lib/validations/registrations";

const validSelfRegistration = {
  event_id: "yilan-hotspring-T013",
  name: "小明",
  email: "ming@example.com",
  phone: "0912345678",
  gender: "male" as const,
  id_number: "A123456789",
  birthday: "1990-01-15",
  emergency_contact_name: "小華",
  emergency_contact_phone: "0987654321",
  dietary: "omnivore" as const,
  transport: "self" as const,
};

const validCarpoolPassenger = {
  ...validSelfRegistration,
  transport: "carpool" as const,
  pickup_location: "taipei",
  carpool_role: "passenger" as const,
};

const validCarpoolDriver = {
  ...validCarpoolPassenger,
  carpool_role: "driver" as const,
  seat_count: 4,
};

describe("createRegistrationSchema", () => {
  it("accepts valid self-drive registration", () => {
    const result = createRegistrationSchema.safeParse(validSelfRegistration);
    expect(result.success).toBe(true);
  });

  it("accepts valid carpool passenger", () => {
    const result = createRegistrationSchema.safeParse(validCarpoolPassenger);
    expect(result.success).toBe(true);
  });

  it("accepts valid carpool driver", () => {
    const result = createRegistrationSchema.safeParse(validCarpoolDriver);
    expect(result.success).toBe(true);
  });

  it("rejects carpool without pickup_location", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      transport: "carpool",
    });
    expect(result.success).toBe(false);
  });

  it("rejects driver without seat_count", () => {
    const result = createRegistrationSchema.safeParse({
      ...validCarpoolPassenger,
      carpool_role: "driver",
    });
    expect(result.success).toBe(false);
  });

  it("rejects seat_count > 5", () => {
    const result = createRegistrationSchema.safeParse({
      ...validCarpoolDriver,
      seat_count: 6,
    });
    expect(result.success).toBe(false);
  });
});

describe("paymentRefSchema", () => {
  it("accepts valid 5-digit ref", () => {
    const result = paymentRefSchema.safeParse({
      payment_ref: "12345",
      token: "abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-numeric ref", () => {
    const result = paymentRefSchema.safeParse({
      payment_ref: "abcde",
      token: "abc123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects ref with wrong length", () => {
    const result = paymentRefSchema.safeParse({
      payment_ref: "1234",
      token: "abc123",
    });
    expect(result.success).toBe(false);
  });
});
