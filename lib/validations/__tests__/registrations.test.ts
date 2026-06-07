import { describe, expect, it } from "vitest";

import {
  createRegistrationSchema,
  paymentRefSchema,
  registrationFormSchema,
  updateRegistrationSchema,
} from "@/lib/validations/registrations";

const validBase = {
  event_id: "evt-1",
  country: "TW",
  name: "張小明",
  email: "Test@Example.com",
  phone: "+886912345678",
  line_id: null,
  gender: "male",
  id_number: "A123456789",
  birthday: "1990-05-15",
  emergency_contact_name: "李大華",
  emergency_contact_phone: "+886911111111",
  dietary: "omnivore",
  rental_details: null,
  notes: null,
  transport: "self",
  pickup_location: null,
  carpool_role: null,
  seat_count: null,
  guardian_consent: null,
  selected_date: null,
};

describe("createRegistrationSchema", () => {
  describe("基礎欄位驗證", () => {
    it("所有欄位正確時 parse 成功", () => {
      const result = createRegistrationSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });

    it("email 自動 trim + lowercase", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        email: "  Test@Example.COM  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("test@example.com");
      }
    });

    it("name 自動 trim，空白字串視為空值失敗", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        name: "   ",
      });
      expect(result.success).toBe(false);
    });

    it("email 格式錯誤時失敗", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
    });

    it("phone 不符合 E.164 格式時失敗", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        phone: "0912345678",
      });
      expect(result.success).toBe(false);
    });

    it("gender 只接受 male/female/other", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        gender: "unknown",
      });
      expect(result.success).toBe(false);
    });

    it("dietary 只接受四種選項", () => {
      const valid = ["omnivore", "no_beef", "vegetarian", "vegan"];
      for (const d of valid) {
        expect(
          createRegistrationSchema.safeParse({ ...validBase, dietary: d })
            .success
        ).toBe(true);
      }
      expect(
        createRegistrationSchema.safeParse({
          ...validBase,
          dietary: "halal",
        }).success
      ).toBe(false);
    });
  });

  describe("line_id 處理", () => {
    it("空字串轉為 null", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        line_id: "",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.line_id).toBeNull();
      }
    });

    it("合法 LINE ID 通過", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        line_id: "my_line.id-123",
      });
      expect(result.success).toBe(true);
    });

    it("含特殊字元的 LINE ID 失敗", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        line_id: "line@id!",
      });
      expect(result.success).toBe(false);
    });

    it("超過 20 字元的 LINE ID 失敗", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        line_id: "a".repeat(21),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("birthday 驗證", () => {
    it("合法日期通過", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        birthday: "2000-01-01",
      });
      expect(result.success).toBe(true);
    });

    it("未來日期失敗", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        birthday: "2099-01-01",
      });
      expect(result.success).toBe(false);
    });

    it("1900 年以前失敗", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        birthday: "1899-12-31",
      });
      expect(result.success).toBe(false);
    });

    it("非日期格式失敗", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        birthday: "not-a-date",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("carpool 條件必填", () => {
    it("transport=carpool 時 pickup_location 必填", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        transport: "carpool",
        pickup_location: null,
        carpool_role: "passenger",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join("."));
        expect(paths).toContain("pickup_location");
      }
    });

    it("transport=carpool 時 carpool_role 必填", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        transport: "carpool",
        pickup_location: "台北",
        carpool_role: null,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join("."));
        expect(paths).toContain("carpool_role");
      }
    });

    it("transport=carpool + driver 時 seat_count 必填", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        transport: "carpool",
        pickup_location: "台北",
        carpool_role: "driver",
        seat_count: null,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join("."));
        expect(paths).toContain("seat_count");
      }
    });

    it("transport=carpool + passenger 時 seat_count 可以是 null", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        transport: "carpool",
        pickup_location: "台北",
        carpool_role: "passenger",
        seat_count: null,
      });
      expect(result.success).toBe(true);
    });

    it("transport=carpool + driver + seat_count=4 通過", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        transport: "carpool",
        pickup_location: "台北",
        carpool_role: "driver",
        seat_count: 4,
      });
      expect(result.success).toBe(true);
    });

    it("seat_count 範圍 3-5，超出失敗", () => {
      expect(
        createRegistrationSchema.safeParse({
          ...validBase,
          transport: "carpool",
          pickup_location: "台北",
          carpool_role: "driver",
          seat_count: 2,
        }).success
      ).toBe(false);

      expect(
        createRegistrationSchema.safeParse({
          ...validBase,
          transport: "carpool",
          pickup_location: "台北",
          carpool_role: "driver",
          seat_count: 6,
        }).success
      ).toBe(false);
    });

    it("transport=self 時 carpool 欄位可以都是 null", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        transport: "self",
        pickup_location: null,
        carpool_role: null,
        seat_count: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("台灣身分證/居留證驗證", () => {
    it("合法身分證通過（A123456789）", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        country: "TW",
        id_number: "A123456789",
      });
      expect(result.success).toBe(true);
    });

    it("id_number 自動 toUpperCase", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        country: "TW",
        id_number: "a123456789",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id_number).toBe("A123456789");
      }
    });

    it("格式正確但 checksum 錯誤時失敗", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        country: "TW",
        id_number: "A123456780",
      });
      expect(result.success).toBe(false);
    });

    it("格式不符時失敗（太短）", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        country: "TW",
        id_number: "A12345",
      });
      expect(result.success).toBe(false);
    });

    it("居留證格式（第二碼 A-D）通過", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        country: "TW",
        id_number: "AC12345678",
      });
      if (result.success) {
        expect(result.data.id_number).toBe("AC12345678");
      }
    });
  });

  describe("護照驗證（非台灣）", () => {
    it("合法護照號碼通過", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        country: "JP",
        id_number: "TK1234567",
      });
      expect(result.success).toBe(true);
    });

    it("含特殊字元的護照號碼失敗", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        country: "JP",
        id_number: "TK-123",
      });
      expect(result.success).toBe(false);
    });

    it("太短的護照號碼失敗", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        country: "JP",
        id_number: "AB12",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("未成年監護人同意", () => {
    it("未滿 18 歲且未勾同意時失敗", () => {
      const today = new Date();
      const tenYearsAgo = `${today.getFullYear() - 10}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const result = createRegistrationSchema.safeParse({
        ...validBase,
        birthday: tenYearsAgo,
        guardian_consent: null,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join("."));
        expect(paths).toContain("guardian_consent");
      }
    });

    it("未滿 18 歲但勾了同意時通過", () => {
      const today = new Date();
      const tenYearsAgo = `${today.getFullYear() - 10}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const result = createRegistrationSchema.safeParse({
        ...validBase,
        birthday: tenYearsAgo,
        guardian_consent: true,
      });
      expect(result.success).toBe(true);
    });

    it("滿 18 歲不需要 guardian_consent", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        birthday: "1990-01-01",
        guardian_consent: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("rental_details 結構", () => {
    it("合法 rental_details 通過", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        rental_details: { clothing_size: "M", shoe_size: 27 },
      });
      expect(result.success).toBe(true);
    });

    it("clothing_size 不在範圍內失敗", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        rental_details: { clothing_size: "XXL", shoe_size: 27 },
      });
      expect(result.success).toBe(false);
    });

    it("shoe_size 超出 23-32 範圍失敗", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        rental_details: { clothing_size: "M", shoe_size: 22 },
      });
      expect(result.success).toBe(false);
    });

    it("null 表示不租借", () => {
      const result = createRegistrationSchema.safeParse({
        ...validBase,
        rental_details: null,
      });
      expect(result.success).toBe(true);
    });
  });
});

describe("updateRegistrationSchema", () => {
  it("空物件通過（所有欄位 optional）", () => {
    const result = updateRegistrationSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("可以只更新單一欄位", () => {
    const result = updateRegistrationSchema.safeParse({ notes: "新備註" });
    expect(result.success).toBe(true);
  });

  it("可以更新 status", () => {
    const result = updateRegistrationSchema.safeParse({ status: "paid" });
    expect(result.success).toBe(true);
  });

  it("status 只接受 pending/paid/failed", () => {
    const result = updateRegistrationSchema.safeParse({ status: "cancelled" });
    expect(result.success).toBe(false);
  });
});

describe("paymentRefSchema", () => {
  it("5 位數字通過", () => {
    const result = paymentRefSchema.safeParse({
      payment_ref: "12345",
      token: "some-token",
    });
    expect(result.success).toBe(true);
  });

  it("4 位數字失敗", () => {
    const result = paymentRefSchema.safeParse({
      payment_ref: "1234",
      token: "some-token",
    });
    expect(result.success).toBe(false);
  });

  it("含字母失敗", () => {
    const result = paymentRefSchema.safeParse({
      payment_ref: "1234A",
      token: "some-token",
    });
    expect(result.success).toBe(false);
  });

  it("token 空字串失敗", () => {
    const result = paymentRefSchema.safeParse({
      payment_ref: "12345",
      token: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("registrationFormSchema", () => {
  const formBase = {
    country: "TW",
    name: "張小明",
    email: "test@example.com",
    phone: "0912345678",
    line_id: null,
    gender: "male",
    id_number: "A123456789",
    birthday: "1990-05-15",
    emergency_contact_name: "李大華",
    emergency_contact_phone: "0911111111",
    dietary: "omnivore",
    rental_details: null,
    notes: null,
    transport: "self",
    pickup_location: null,
    carpool_role: null,
    seat_count: null,
    guardian_consent: null,
  };

  it("不含 event_id 和 selected_date", () => {
    const result = registrationFormSchema.safeParse(formBase);
    expect(result.success).toBe(true);
  });

  it("phone 不要求 E.164 格式（前端本地號碼）", () => {
    const result = registrationFormSchema.safeParse({
      ...formBase,
      phone: "0912345678",
    });
    expect(result.success).toBe(true);
  });

  it("carpool 條件必填仍然生效", () => {
    const result = registrationFormSchema.safeParse({
      ...formBase,
      transport: "carpool",
      pickup_location: null,
      carpool_role: null,
    });
    expect(result.success).toBe(false);
  });
});
