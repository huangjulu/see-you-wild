import { describe, expect, it } from "vitest";

import { isLineAudience } from "@/lib/line/audience";

const ruru = "U" + "a".repeat(32);
const other = "U" + "b".repeat(32);

describe("isLineAudience", () => {
  it("admin 模式名單內 true", () => {
    expect(
      isLineAudience(ruru, {
        LINE_AUDIENCE: "admin",
        LINE_ADMIN_USER_IDS: ruru,
      })
    ).toBe(true);
  });

  it("admin 模式名單外 false", () => {
    expect(
      isLineAudience(other, {
        LINE_AUDIENCE: "admin",
        LINE_ADMIN_USER_IDS: ruru,
      })
    ).toBe(false);
  });

  it("名單空 false（fail closed）", () => {
    expect(isLineAudience(ruru, { LINE_AUDIENCE: "admin" })).toBe(false);
  });

  it("未設 audience 視同 admin", () => {
    expect(isLineAudience(other, { LINE_ADMIN_USER_IDS: ruru })).toBe(false);
  });

  it("audience 打錯字視同 admin", () => {
    expect(
      isLineAudience(other, { LINE_AUDIENCE: "all", LINE_ADMIN_USER_IDS: ruru })
    ).toBe(false);
  });

  it("open 模式任意 userId true", () => {
    expect(isLineAudience(other, { LINE_AUDIENCE: "open" })).toBe(true);
  });

  it("名單含非法 id 整份作廢", () => {
    expect(
      isLineAudience(ruru, {
        LINE_AUDIENCE: "admin",
        LINE_ADMIN_USER_IDS: `${ruru},not-a-line-id`,
      })
    ).toBe(false);
  });

  it("名單逗號兩側空白可容忍", () => {
    expect(
      isLineAudience(other, {
        LINE_AUDIENCE: "admin",
        LINE_ADMIN_USER_IDS: `${ruru}, ${other}`,
      })
    ).toBe(true);
  });
});
