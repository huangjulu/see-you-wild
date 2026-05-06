// Centralized form rules for the registration form.
// Owns: country whitelist, ID/passport regex + checksum, phone normalization,
// age calculation, and shared field length limits. Pure logic, no React/zod.

export interface CountryRule {
  iso: string;
  nameZh: string;
  nameEn: string;
  dialCode: string;
  phoneExample: string;
  trunkPrefix: string | null;
}

export const COUNTRY_OPTIONS: readonly CountryRule[] = [
  {
    iso: "TW",
    nameZh: "台灣",
    nameEn: "Taiwan",
    dialCode: "+886",
    phoneExample: "+886 912 345 678",
    trunkPrefix: "0",
  },
  {
    iso: "HK",
    nameZh: "香港",
    nameEn: "Hong Kong",
    dialCode: "+852",
    phoneExample: "+852 5123 4567",
    trunkPrefix: null,
  },
  {
    iso: "MO",
    nameZh: "澳門",
    nameEn: "Macau",
    dialCode: "+853",
    phoneExample: "+853 6612 3456",
    trunkPrefix: null,
  },
  {
    iso: "CN",
    nameZh: "中國",
    nameEn: "China",
    dialCode: "+86",
    phoneExample: "+86 131 2345 6789",
    trunkPrefix: "0",
  },
  {
    iso: "JP",
    nameZh: "日本",
    nameEn: "Japan",
    dialCode: "+81",
    phoneExample: "+81 90 1234 5678",
    trunkPrefix: "0",
  },
  {
    iso: "KR",
    nameZh: "韓國",
    nameEn: "South Korea",
    dialCode: "+82",
    phoneExample: "+82 10 1234 5678",
    trunkPrefix: "0",
  },
  {
    iso: "SG",
    nameZh: "新加坡",
    nameEn: "Singapore",
    dialCode: "+65",
    phoneExample: "+65 8123 4567",
    trunkPrefix: null,
  },
  {
    iso: "MY",
    nameZh: "馬來西亞",
    nameEn: "Malaysia",
    dialCode: "+60",
    phoneExample: "+60 12 345 6789",
    trunkPrefix: "0",
  },
  {
    iso: "US",
    nameZh: "美國",
    nameEn: "United States",
    dialCode: "+1",
    phoneExample: "+1 415 555 0132",
    trunkPrefix: "1",
  },
  {
    iso: "UK",
    nameZh: "英國",
    nameEn: "United Kingdom",
    dialCode: "+44",
    phoneExample: "+44 7400 123456",
    trunkPrefix: "0",
  },
  {
    iso: "FR",
    nameZh: "法國",
    nameEn: "France",
    dialCode: "+33",
    phoneExample: "+33 6 12 34 56 78",
    trunkPrefix: "0",
  },
  {
    iso: "DE",
    nameZh: "德國",
    nameEn: "Germany",
    dialCode: "+49",
    phoneExample: "+49 151 23456789",
    trunkPrefix: "0",
  },
  {
    iso: "IT",
    nameZh: "義大利",
    nameEn: "Italy",
    dialCode: "+39",
    phoneExample: "+39 312 345 6789",
    trunkPrefix: null,
  },
  {
    iso: "ES",
    nameZh: "西班牙",
    nameEn: "Spain",
    dialCode: "+34",
    phoneExample: "+34 612 34 56 78",
    trunkPrefix: null,
  },
  {
    iso: "NL",
    nameZh: "荷蘭",
    nameEn: "Netherlands",
    dialCode: "+31",
    phoneExample: "+31 6 12345678",
    trunkPrefix: "0",
  },
  {
    iso: "CH",
    nameZh: "瑞士",
    nameEn: "Switzerland",
    dialCode: "+41",
    phoneExample: "+41 78 123 45 67",
    trunkPrefix: "0",
  },
  {
    iso: "SE",
    nameZh: "瑞典",
    nameEn: "Sweden",
    dialCode: "+46",
    phoneExample: "+46 70 123 45 67",
    trunkPrefix: "0",
  },
] as const;

export const COUNTRY_ISO_CODES: readonly [string, ...string[]] = [
  "TW",
  "HK",
  "MO",
  "CN",
  "JP",
  "KR",
  "SG",
  "MY",
  "US",
  "UK",
  "FR",
  "DE",
  "IT",
  "ES",
  "NL",
  "CH",
  "SE",
] as const;

export type CountryIso = (typeof COUNTRY_ISO_CODES)[number];

const COUNTRY_BY_ISO: Map<string, CountryRule> = new Map(
  COUNTRY_OPTIONS.map((c) => [c.iso, c])
);

export function getCountryByIso(iso: string): CountryRule | undefined {
  return COUNTRY_BY_ISO.get(iso);
}

// ============================================
// ID number rules
// ============================================

export const TW_ID_REGEX: RegExp = /^[A-Z]\d{9}$/;
export const PASSPORT_REGEX: RegExp = /^[A-Z0-9]{6,12}$/;

const TW_ID_LETTER_VALUES: Record<string, number> = {
  A: 10,
  B: 11,
  C: 12,
  D: 13,
  E: 14,
  F: 15,
  G: 16,
  H: 17,
  I: 34,
  J: 18,
  K: 19,
  L: 20,
  M: 21,
  N: 22,
  O: 35,
  P: 23,
  Q: 24,
  R: 25,
  S: 26,
  T: 27,
  U: 28,
  V: 29,
  W: 32,
  X: 30,
  Y: 31,
  Z: 33,
};

const TW_ID_WEIGHTS: readonly number[] = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1];

export function isValidTwId(id: string): boolean {
  if (!TW_ID_REGEX.test(id)) return false;

  const letterValue = TW_ID_LETTER_VALUES[id[0]];
  if (letterValue === undefined) return false;

  const digits: number[] = [
    Math.floor(letterValue / 10),
    letterValue % 10,
    ...id
      .slice(1)
      .split("")
      .map((d) => d.charCodeAt(0) - "0".charCodeAt(0)),
  ];

  let sum = 0;
  for (let i = 0; i < TW_ID_WEIGHTS.length; i++) {
    sum += digits[i] * TW_ID_WEIGHTS[i];
  }
  return sum % 10 === 0;
}

// ============================================
// Phone E.164 + normalization
// ============================================

export const E164_REGEX: RegExp = /^\+\d{8,15}$/;

// Strips spaces, dashes, parentheses; if input already has '+' returns as-is
// (only valid if E164_REGEX passes). Otherwise drops the country's trunk prefix
// when present, then prepends the dial code.
// Returns null when the result would not match E.164.
export function normalizePhone(
  input: string,
  country: CountryRule
): string | null {
  if (typeof input !== "string") return null;

  const cleaned = input.replace(/[\s\-()]/g, "");
  if (cleaned.length === 0) return null;

  if (cleaned.startsWith("+")) {
    return E164_REGEX.test(cleaned) ? cleaned : null;
  }

  if (!/^\d+$/.test(cleaned)) return null;

  let local = cleaned;
  if (country.trunkPrefix && local.startsWith(country.trunkPrefix)) {
    local = local.slice(country.trunkPrefix.length);
  }

  if (local.length === 0) return null;

  const candidate = `${country.dialCode}${local}`;
  return E164_REGEX.test(candidate) ? candidate : null;
}

// ============================================
// Age calculation
// ============================================

// Returns the completed years between birthday (ISO YYYY-MM-DD) and `today`.
// Birthday-of-the-day counts as a full year; the day before does not.
// Returns NaN when birthday is unparseable.
export function calculateAge(
  birthday: string,
  today: Date = new Date()
): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthday);
  if (!match) return Number.NaN;

  const birthYear = parseInt(match[1], 10);
  const birthMonth = parseInt(match[2], 10);
  const birthDay = parseInt(match[3], 10);

  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  let age = todayYear - birthYear;
  if (
    todayMonth < birthMonth ||
    (todayMonth === birthMonth && todayDay < birthDay)
  ) {
    age -= 1;
  }
  return age;
}

// ============================================
// Field constraints
// ============================================

export const MAX_LENGTHS = {
  name: 50,
  emergency_contact_name: 50,
  line_id: 20,
  notes: 500,
} as const;

export const LINE_ID_REGEX: RegExp = /^[a-zA-Z0-9._-]+$/;
