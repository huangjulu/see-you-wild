export const locales = ["zh-TW", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "zh-TW";

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export type PageProps<T = {}> = {
  params: Promise<{ locale: string } & T>;
};

export type {
  MessageKey,
  MessageNamespace,
  Messages,
  TranslationFunction,
} from "./types";
