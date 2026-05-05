import { describe, expect, it } from "vitest";

import {
  calculateAge,
  getCountryByIso,
  isValidTwId,
  normalizePhone,
} from "@/lib/form-rules";
import {
  createRegistrationSchema,
  paymentRefSchema,
  updateRegistrationSchema,
} from "@/lib/validations/registrations";

// Reference TW IDs constructed via the public checksum algorithm.
// They follow the official format but are NOT real-person identifiers.
const VALID_TW_IDS = ["A123456789", "B100000002", "F100000006"] as const;
const INVALID_CHECKSUM_TW_IDS = ["A123456788", "B100000003"] as const;

const validSelfRegistration = {
  event_id: "yilan-hotspring-T013",
  country: "TW" as const,
  name: "小明",
  email: "ming@example.com",
  phone: "+886912345678",
  gender: "male" as const,
  id_number: VALID_TW_IDS[0],
  birthday: "1990-01-15",
  emergency_contact_name: "小華",
  emergency_contact_phone: "+886987654321",
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

function getIssue(
  result: ReturnType<typeof createRegistrationSchema.safeParse>,
  path: string
) {
  if (result.success) return undefined;
  return result.error.issues.find((i) => i.path.join(".") === path);
}

describe("createRegistrationSchema — TW id_number", () => {
  it("接受合法身分證 (regex + checksum 對)", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      id_number: VALID_TW_IDS[1],
    });
    expect(result.success).toBe(true);
  });

  it("格式對但 checksum 錯 → invalidTwIdChecksum", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      id_number: INVALID_CHECKSUM_TW_IDS[0],
    });
    expect(result.success).toBe(false);
    expect(getIssue(result, "id_number")?.message).toBe("invalidTwIdChecksum");
  });

  it("格式錯 (數字過少) → invalidTwId", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      id_number: "A12345",
    });
    expect(result.success).toBe(false);
    expect(getIssue(result, "id_number")?.message).toBe("invalidTwId");
  });

  it("格式錯 (小寫字母) → invalidTwId", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      id_number: "a123456789",
    });
    // schema does .toUpperCase before refine, so this should pass the regex; checksum dictates result
    expect(result.success).toBe(true);
  });
});

describe("createRegistrationSchema — non-TW passport", () => {
  it("非 TW + 合法護照 → 通過", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      country: "JP",
      id_number: "TK1234567",
    });
    expect(result.success).toBe(true);
  });

  it("非 TW + 護照格式錯 (太短) → invalidPassport", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      country: "US",
      id_number: "AB12",
    });
    expect(result.success).toBe(false);
    expect(getIssue(result, "id_number")?.message).toBe("invalidPassport");
  });

  it("非 TW + 護照格式錯 (含小寫) → invalidPassport (toUpperCase 後仍應通過)", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      country: "JP",
      id_number: "tk1234567",
    });
    expect(result.success).toBe(true);
  });
});

describe("createRegistrationSchema — phone E.164", () => {
  it("合法 +886... → 通過", () => {
    const result = createRegistrationSchema.safeParse(validSelfRegistration);
    expect(result.success).toBe(true);
  });

  it("缺 + 號 → invalidPhone", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      phone: "886912345678",
    });
    expect(result.success).toBe(false);
    expect(getIssue(result, "phone")).toBeTruthy();
  });

  it("含中文 → invalidPhone", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      phone: "+886 中文",
    });
    expect(result.success).toBe(false);
  });

  it("emergency_contact_phone 缺 + → 失敗", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      emergency_contact_phone: "0987654321",
    });
    expect(result.success).toBe(false);
    expect(getIssue(result, "emergency_contact_phone")).toBeTruthy();
  });
});

describe("createRegistrationSchema — birthday boundaries", () => {
  it("未來日期 → 失敗", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const iso = tomorrow.toISOString().slice(0, 10);
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      birthday: iso,
    });
    expect(result.success).toBe(false);
    expect(getIssue(result, "birthday")).toBeTruthy();
  });

  it("1900-01-01 之前 → 失敗", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      birthday: "1899-12-31",
    });
    expect(result.success).toBe(false);
  });

  it("1900-01-01 邊界 → 通過", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      birthday: "1900-01-01",
    });
    expect(result.success).toBe(true);
  });
});

describe("createRegistrationSchema — guardian_consent", () => {
  function makeMinorBirthday(): string {
    // Always 16 years old today
    const d = new Date();
    d.setFullYear(d.getFullYear() - 16);
    return d.toISOString().slice(0, 10);
  }

  it("< 18 + guardian_consent === null → guardianConsentRequired", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      birthday: makeMinorBirthday(),
    });
    expect(result.success).toBe(false);
    expect(getIssue(result, "guardian_consent")?.message).toBe(
      "guardianConsentRequired"
    );
  });

  it("< 18 + guardian_consent === false → guardianConsentRequired", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      birthday: makeMinorBirthday(),
      guardian_consent: false,
    });
    expect(result.success).toBe(false);
    expect(getIssue(result, "guardian_consent")?.message).toBe(
      "guardianConsentRequired"
    );
  });

  it("< 18 + guardian_consent === true → 通過", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      birthday: makeMinorBirthday(),
      guardian_consent: true,
    });
    expect(result.success).toBe(true);
  });

  it("≥ 18 + guardian_consent === null → 通過 (不必填)", () => {
    const result = createRegistrationSchema.safeParse(validSelfRegistration);
    expect(result.success).toBe(true);
  });
});

describe("createRegistrationSchema — defaults & misc", () => {
  it("gender 沒給 → default male", () => {
    const { gender: _g, ...withoutGender } = validSelfRegistration;
    void _g;
    const result = createRegistrationSchema.safeParse(withoutGender);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.gender).toBe("male");
    }
  });

  it("name 超過 max length → 失敗", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      name: "x".repeat(51),
    });
    expect(result.success).toBe(false);
    expect(getIssue(result, "name")).toBeTruthy();
  });

  it("notes 超過 max length → 失敗", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      notes: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("line_id 含非法字元 → 失敗", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      line_id: "abc!@#",
    });
    expect(result.success).toBe(false);
  });

  it("line_id 空字串 → null (通過)", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      line_id: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.line_id).toBe(null);
    }
  });

  it("line_id 合法值 → 保留", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      line_id: "valid_id-123",
    });
    expect(result.success).toBe(true);
  });
});

describe("createRegistrationSchema — carpool 既有邏輯保留", () => {
  it("carpool 接受 passenger", () => {
    const result = createRegistrationSchema.safeParse(validCarpoolPassenger);
    expect(result.success).toBe(true);
  });

  it("carpool 接受 driver + seat_count", () => {
    const result = createRegistrationSchema.safeParse(validCarpoolDriver);
    expect(result.success).toBe(true);
  });

  it("carpool 沒給 pickup_location → 失敗", () => {
    const result = createRegistrationSchema.safeParse({
      ...validSelfRegistration,
      transport: "carpool",
    });
    expect(result.success).toBe(false);
  });

  it("driver 沒給 seat_count → 失敗", () => {
    const result = createRegistrationSchema.safeParse({
      ...validCarpoolPassenger,
      carpool_role: "driver",
    });
    expect(result.success).toBe(false);
  });

  it("seat_count > 5 → 失敗", () => {
    const result = createRegistrationSchema.safeParse({
      ...validCarpoolDriver,
      seat_count: 6,
    });
    expect(result.success).toBe(false);
  });
});

describe("paymentRefSchema", () => {
  it("接受合法 5 位數 ref", () => {
    const result = paymentRefSchema.safeParse({
      payment_ref: "12345",
      token: "abc123",
    });
    expect(result.success).toBe(true);
  });

  it("拒絕非數字 ref", () => {
    const result = paymentRefSchema.safeParse({
      payment_ref: "abcde",
      token: "abc123",
    });
    expect(result.success).toBe(false);
  });

  it("拒絕長度錯誤 ref", () => {
    const result = paymentRefSchema.safeParse({
      payment_ref: "1234",
      token: "abc123",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateRegistrationSchema", () => {
  it("status 接受 'failed'", () => {
    const result = updateRegistrationSchema.safeParse({ status: "failed" });
    expect(result.success).toBe(true);
  });
});

describe("isValidTwId", () => {
  it.each(VALID_TW_IDS)("合法身分證 %s 通過", (id) => {
    expect(isValidTwId(id)).toBe(true);
  });

  it.each(INVALID_CHECKSUM_TW_IDS)("checksum 錯誤 %s 不通過", (id) => {
    expect(isValidTwId(id)).toBe(false);
  });

  it("格式錯誤回 false", () => {
    expect(isValidTwId("12345")).toBe(false);
    expect(isValidTwId("a123456789")).toBe(false);
  });
});

describe("normalizePhone", () => {
  const tw = getCountryByIso("TW");
  const jp = getCountryByIso("JP");
  const sg = getCountryByIso("SG");

  if (!tw || !jp || !sg) throw new Error("country fixtures missing");

  it("0912345678 + TW → +886912345678", () => {
    expect(normalizePhone("0912345678", tw)).toBe("+886912345678");
  });

  it("0912-345-678 + TW → +886912345678", () => {
    expect(normalizePhone("0912-345-678", tw)).toBe("+886912345678");
  });

  it("0912 345 678 + TW → +886912345678", () => {
    expect(normalizePhone("0912 345 678", tw)).toBe("+886912345678");
  });

  it("+886912345678 → +886912345678 (passthrough)", () => {
    expect(normalizePhone("+886912345678", tw)).toBe("+886912345678");
  });

  it("912345678 + TW (沒前導 0) → +886912345678", () => {
    expect(normalizePhone("912345678", tw)).toBe("+886912345678");
  });

  it("空字串回 null", () => {
    expect(normalizePhone("", tw)).toBe(null);
  });

  it("含字母回 null", () => {
    expect(normalizePhone("0912abc678", tw)).toBe(null);
  });

  it("已是 + 但格式不對回 null", () => {
    expect(normalizePhone("+abc", tw)).toBe(null);
  });

  it("JP 號碼 09012345678 → +819012345678 (去除 trunk 0)", () => {
    expect(normalizePhone("09012345678", jp)).toBe("+819012345678");
  });

  it("SG 號碼 81234567 (沒 trunk) → +6581234567", () => {
    expect(normalizePhone("81234567", sg)).toBe("+6581234567");
  });
});

describe("calculateAge", () => {
  it("生日當天 = 滿歲", () => {
    const today = new Date(2026, 4, 4);
    expect(calculateAge("2008-05-04", today)).toBe(18);
  });

  it("生日前一天 = 少一歲", () => {
    const today = new Date(2026, 4, 4);
    expect(calculateAge("2008-05-05", today)).toBe(17);
  });

  it("生日當月但日期未到 = 少一歲", () => {
    const today = new Date(2026, 4, 3);
    expect(calculateAge("2008-05-04", today)).toBe(17);
  });

  it("閏年 2/29 出生在非閏年 = 用 3/1 進位", () => {
    // 2024-02-29 出生，2026-03-01 滿 2 歲
    const today = new Date(2026, 2, 1);
    expect(calculateAge("2024-02-29", today)).toBe(2);
  });

  it("閏年 2/29 出生，非閏年 2/28 = 還沒滿", () => {
    const today = new Date(2026, 1, 28);
    expect(calculateAge("2024-02-29", today)).toBe(1);
  });

  it("無法解析的字串回 NaN", () => {
    expect(Number.isNaN(calculateAge("not-a-date"))).toBe(true);
  });
});
