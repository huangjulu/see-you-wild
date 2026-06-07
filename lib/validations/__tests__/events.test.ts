import { describe, expect, it } from "vitest";

import {
  createEventSchema,
  deleteEventSchema,
  updateEventSchema,
} from "@/lib/validations/events";

const validEvent = {
  id: "evt-1",
  type: "trip",
  location: "宜蘭",
  title: "宜蘭野溪溫泉",
  start_date: "2026-08-01",
  end_date: "2026-08-02",
  base_price: 4800,
  carpool_surcharge: 100,
  payment_days: 7,
  available_dates: ["2026-08-01", "2026-08-02"],
};

describe("createEventSchema", () => {
  describe("必填欄位", () => {
    it("最小必填欄位通過", () => {
      const result = createEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it("缺 id 失敗", () => {
      const { id: _, ...noId } = validEvent;
      void _;
      expect(createEventSchema.safeParse(noId).success).toBe(false);
    });

    it("缺 available_dates 失敗", () => {
      const { available_dates: _, ...noAvail } = validEvent;
      void _;
      expect(createEventSchema.safeParse(noAvail).success).toBe(false);
    });

    it("available_dates 空陣列失敗（min(1)）", () => {
      expect(
        createEventSchema.safeParse({ ...validEvent, available_dates: [] })
          .success
      ).toBe(false);
    });
  });

  describe("數值驗證", () => {
    it("base_price 必須正整數", () => {
      expect(
        createEventSchema.safeParse({ ...validEvent, base_price: 0 }).success
      ).toBe(false);
      expect(
        createEventSchema.safeParse({ ...validEvent, base_price: -100 }).success
      ).toBe(false);
      expect(
        createEventSchema.safeParse({ ...validEvent, base_price: 99.5 }).success
      ).toBe(false);
    });

    it("carpool_surcharge 必須正整數", () => {
      expect(
        createEventSchema.safeParse({ ...validEvent, carpool_surcharge: 0 })
          .success
      ).toBe(false);
    });

    it("driver_refund_per_passenger 可以是 0", () => {
      const result = createEventSchema.safeParse({
        ...validEvent,
        driver_refund_per_passenger: 0,
      });
      expect(result.success).toBe(true);
    });

    it("payment_days 必須正整數", () => {
      expect(
        createEventSchema.safeParse({ ...validEvent, payment_days: 0 }).success
      ).toBe(false);
    });

    it("min_participants 最小 1", () => {
      expect(
        createEventSchema.safeParse({ ...validEvent, min_participants: 0 })
          .success
      ).toBe(false);
    });
  });

  describe("預設值", () => {
    it("driver_refund_per_passenger 預設 0", () => {
      const result = createEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.driver_refund_per_passenger).toBe(0);
      }
    });

    it("carpool_cutoff_days 預設 3", () => {
      const result = createEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.carpool_cutoff_days).toBe(3);
      }
    });

    it("status 預設 open", () => {
      const result = createEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("open");
      }
    });

    it("carpool_enabled 預設 true", () => {
      const result = createEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.carpool_enabled).toBe(true);
      }
    });

    it("rental_enabled 預設 false", () => {
      const result = createEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rental_enabled).toBe(false);
      }
    });
  });

  describe("日期格式", () => {
    it("ISO 日期格式通過", () => {
      expect(
        createEventSchema.safeParse({
          ...validEvent,
          start_date: "2026-08-01",
        }).success
      ).toBe(true);
    });

    it("非日期格式失敗", () => {
      expect(
        createEventSchema.safeParse({
          ...validEvent,
          start_date: "Aug 1, 2026",
        }).success
      ).toBe(false);
    });

    it("available_dates 內含非日期格式失敗", () => {
      expect(
        createEventSchema.safeParse({
          ...validEvent,
          available_dates: ["2026-08-01", "not-a-date"],
        }).success
      ).toBe(false);
    });
  });

  describe("images 結構", () => {
    it("合法 images 通過", () => {
      const result = createEventSchema.safeParse({
        ...validEvent,
        images: [{ src: "https://example.com/img.jpg", alt: "照片" }],
      });
      expect(result.success).toBe(true);
    });

    it("images.src 必須是 URL", () => {
      expect(
        createEventSchema.safeParse({
          ...validEvent,
          images: [{ src: "not-a-url", alt: "照片" }],
        }).success
      ).toBe(false);
    });

    it("images 預設空陣列", () => {
      const result = createEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.images).toEqual([]);
      }
    });
  });

  describe("字串長度限制", () => {
    it("preparation_notes 超過 500 字失敗", () => {
      expect(
        createEventSchema.safeParse({
          ...validEvent,
          preparation_notes: "a".repeat(501),
        }).success
      ).toBe(false);
    });

    it("faq 超過 1000 字失敗", () => {
      expect(
        createEventSchema.safeParse({
          ...validEvent,
          faq: "a".repeat(1001),
        }).success
      ).toBe(false);
    });

    it("refund_policy 超過 1000 字失敗", () => {
      expect(
        createEventSchema.safeParse({
          ...validEvent,
          refund_policy: "a".repeat(1001),
        }).success
      ).toBe(false);
    });
  });

  describe("status enum", () => {
    it("open 通過", () => {
      expect(
        createEventSchema.safeParse({ ...validEvent, status: "open" }).success
      ).toBe(true);
    });

    it("closed 通過", () => {
      expect(
        createEventSchema.safeParse({ ...validEvent, status: "closed" }).success
      ).toBe(true);
    });

    it("其他值失敗", () => {
      expect(
        createEventSchema.safeParse({ ...validEvent, status: "draft" }).success
      ).toBe(false);
    });
  });
});

describe("updateEventSchema", () => {
  it("空物件通過（所有欄位 optional）", () => {
    expect(updateEventSchema.safeParse({}).success).toBe(true);
  });

  it("可以只更新 title", () => {
    const result = updateEventSchema.safeParse({ title: "新標題" });
    expect(result.success).toBe(true);
  });

  it("可以更新 carpool_enabled", () => {
    const result = updateEventSchema.safeParse({ carpool_enabled: false });
    expect(result.success).toBe(true);
  });

  it("title 空字串失敗（min(1)）", () => {
    expect(updateEventSchema.safeParse({ title: "" }).success).toBe(false);
  });
});

describe("deleteEventSchema", () => {
  it("有 cancellation_reason 通過", () => {
    expect(
      deleteEventSchema.safeParse({ cancellation_reason: "活動取消" }).success
    ).toBe(true);
  });

  it("cancellation_reason 空字串失敗", () => {
    expect(
      deleteEventSchema.safeParse({ cancellation_reason: "" }).success
    ).toBe(false);
  });

  it("缺 cancellation_reason 失敗", () => {
    expect(deleteEventSchema.safeParse({}).success).toBe(false);
  });
});
