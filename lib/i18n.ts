export const locales = ["zh-TW", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "zh-TW";

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

import type commonZhTW from "@/lib/dictionary/zh-TW/common.json";
import type homeZhTW from "@/lib/dictionary/zh-TW/home.json";

export type CommonDictionary = typeof commonZhTW;
export type HomeDictionary = typeof homeZhTW;

export type Dictionary = {
  common: CommonDictionary;
  home: HomeDictionary;
};

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  "zh-TW": async () => ({
    common: (await import("@/lib/dictionary/zh-TW/common.json")).default,
    home: (await import("@/lib/dictionary/zh-TW/home.json")).default,
  }),
  en: async () => ({
    common: (await import("@/lib/dictionary/en/common.json")).default,
    home: (await import("@/lib/dictionary/en/home.json")).default,
  }),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
