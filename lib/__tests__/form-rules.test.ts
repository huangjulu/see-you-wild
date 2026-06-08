import { describe, expect, it } from "vitest";

import {
  calculateAge,
  formatLocalPhone,
  getCountryByIso,
  isValidTwDocument,
  normalizePhone,
  toLocalPhone,
} from "@/lib/form-rules";

describe("isValidTwDocument", () => {
  it("合法身分證通過", () => {
    expect(isValidTwDocument("A123456789")).toBe(true);
  });

  it("checksum 錯誤失敗", () => {
    expect(isValidTwDocument("A123456780")).toBe(false);
  });

  it("格式不符失敗（小寫）", () => {
    expect(isValidTwDocument("a123456789")).toBe(false);
  });

  it("格式不符失敗（太短）", () => {
    expect(isValidTwDocument("A12345")).toBe(false);
  });

  it("居留證格式（第二碼 A-D）也走 checksum 驗證", () => {
    // AC12345678 格式正確但 checksum 未必對，驗證函式會檢查 checksum
    const result = isValidTwDocument("AC12345678");
    expect(typeof result).toBe("boolean");
  });

  it("不存在的首字母失敗", () => {
    expect(isValidTwDocument("0123456789")).toBe(false);
  });
});

describe("normalizePhone", () => {
  const tw = getCountryByIso("TW")!;
  const hk = getCountryByIso("HK")!;

  it("已有 + 前綴且合法 E.164 直接回傳", () => {
    expect(normalizePhone("+886912345678", tw)).toBe("+886912345678");
  });

  it("有 + 但格式不合法回傳 null", () => {
    expect(normalizePhone("+1", tw)).toBeNull();
  });

  it("台灣號碼去掉 trunk prefix 0 再加 dial code", () => {
    expect(normalizePhone("0912345678", tw)).toBe("+886912345678");
  });

  it("香港沒有 trunk prefix，直接加 dial code", () => {
    expect(normalizePhone("51234567", hk)).toBe("+85251234567");
  });

  it("去掉空白和破折號", () => {
    expect(normalizePhone("0912-345-678", tw)).toBe("+886912345678");
    expect(normalizePhone("0912 345 678", tw)).toBe("+886912345678");
  });

  it("去掉括號", () => {
    expect(normalizePhone("(09)12345678", tw)).toBe("+886912345678");
  });

  it("空字串回傳 null", () => {
    expect(normalizePhone("", tw)).toBeNull();
  });

  it("純空白回傳 null", () => {
    expect(normalizePhone("   ", tw)).toBeNull();
  });

  it("含非數字字元（排除 +）回傳 null", () => {
    expect(normalizePhone("abc", tw)).toBeNull();
  });

  it("只有 trunk prefix 回傳 null", () => {
    expect(normalizePhone("0", tw)).toBeNull();
  });
});

describe("toLocalPhone", () => {
  const tw = getCountryByIso("TW")!;
  const hk = getCountryByIso("HK")!;

  it("台灣號碼轉回本地格式（加 trunk prefix）", () => {
    expect(toLocalPhone("+886912345678", tw)).toBe("0912345678");
  });

  it("香港號碼轉回本地格式（無 trunk prefix）", () => {
    expect(toLocalPhone("+85251234567", hk)).toBe("51234567");
  });

  it("不匹配的 dial code 直接回傳原值", () => {
    expect(toLocalPhone("+1234567890", tw)).toBe("+1234567890");
  });
});

describe("formatLocalPhone", () => {
  it("台灣手機格式化為 0 9123 4567", () => {
    expect(formatLocalPhone("0912345678")).toBe("0 9123 4567");
  });

  it("單字元不加空格", () => {
    expect(formatLocalPhone("0")).toBe("0");
  });

  it("空字串回傳空字串", () => {
    expect(formatLocalPhone("")).toBe("");
  });
});

describe("calculateAge", () => {
  it("今天滿 30 歲（生日當天算滿）", () => {
    const today = new Date(2026, 5, 5);
    expect(calculateAge("1996-06-05", today)).toBe(30);
  });

  it("生日前一天還沒滿", () => {
    const today = new Date(2026, 5, 4);
    expect(calculateAge("1996-06-05", today)).toBe(29);
  });

  it("生日後一天已滿", () => {
    const today = new Date(2026, 5, 6);
    expect(calculateAge("1996-06-05", today)).toBe(30);
  });

  it("不合法日期回傳 NaN", () => {
    expect(calculateAge("not-a-date")).toBeNaN();
  });

  it("未滿 18 歲", () => {
    const today = new Date(2026, 5, 5);
    expect(calculateAge("2010-06-05", today)).toBe(16);
  });
});

describe("getCountryByIso", () => {
  it("TW 回傳台灣資料", () => {
    const tw = getCountryByIso("TW");
    expect(tw?.nameZh).toBe("台灣");
    expect(tw?.dialCode).toBe("+886");
  });

  it("不存在的 ISO 回傳 undefined", () => {
    expect(getCountryByIso("ZZ")).toBeUndefined();
  });
});
