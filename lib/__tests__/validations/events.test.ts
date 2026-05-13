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
});
