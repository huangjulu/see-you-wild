import { describe, it, expect } from "vitest";
import { createEventSchema } from "@/lib/validations/events";

const validEvent = {
  id: "yilan-hotspring-T013",
  type: "野溪溫泉",
  location: "宜蘭",
  title: "宜蘭秘境野溪溫泉",
  start_date: "2026-03-09",
  end_date: "2026-03-09",
  base_price: 2980,
  carpool_surcharge: 300,
  payment_days: 7,
};

describe("createEventSchema", () => {
  it("accepts valid event", () => {
    const result = createEventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it("rejects end_date before start_date", () => {
    const result = createEventSchema.safeParse({
      ...validEvent,
      start_date: "2026-03-10",
      end_date: "2026-03-09",
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
