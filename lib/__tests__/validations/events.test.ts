import { describe, expect, it } from "vitest";

import { createEventSchema } from "@/lib/validations/events";

const validEvent = {
  id: "yilan-hotspring-T013",
  type: "野溪溫泉",
  location: "宜蘭",
  title: "宜蘭秘境野溪溫泉",
  start_date: "2026-03-09",
  end_date: "2026-03-09",
  available_dates: ["2026-03-09"],
  base_price: 2980,
  carpool_surcharge: 300,
  payment_days: 7,
};

describe("createEventSchema", () => {
  it("accepts valid event", () => {
    const result = createEventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it("rejects empty available_dates", () => {
    const result = createEventSchema.safeParse({
      ...validEvent,
      available_dates: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative base_price", () => {
    const result = createEventSchema.safeParse({
      ...validEvent,
      base_price: -100,
    });
    expect(result.success).toBe(false);
  });

  it("defaults min_participants to 3", () => {
    const result = createEventSchema.safeParse(validEvent);
    if (result.success) {
      expect(result.data.min_participants).toBe(3);
    }
  });

  it("defaults description to empty string", () => {
    const result = createEventSchema.safeParse(validEvent);
    if (result.success) {
      expect(result.data.description).toBe("");
    }
  });

  it("defaults pickup_locations to empty array", () => {
    const result = createEventSchema.safeParse(validEvent);
    if (result.success) {
      expect(result.data.pickup_locations).toEqual([]);
    }
  });

  it("accepts images with src and alt", () => {
    const result = createEventSchema.safeParse({
      ...validEvent,
      images: [{ src: "https://example.com/img.jpg", alt: "活動照片" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects images with invalid src URL", () => {
    const result = createEventSchema.safeParse({
      ...validEvent,
      images: [{ src: "not-a-url", alt: "" }],
    });
    expect(result.success).toBe(false);
  });
});
