"use client";

import {
  useLocale as _useLocale,
  useTranslations as _useTranslations,
} from "next-intl";

import type { MessageNamespace, TranslationFunction } from "./types";

export function useTranslations<NS extends MessageNamespace>(
  namespace: NS
): TranslationFunction<NS> {
  // next-intl 的 t() 回傳 opaque internal type (NamespacedMessageKeys + TranslateArgs)，
  // ��法透過 generic constraint 與我們從 JSON 推導的 TranslationFunction 對接，
  // 此處是兩套型別��統的唯一橋接點。

  return _useTranslations(namespace) as unknown as TranslationFunction<NS>;
}

export function useLocale() {
  return _useLocale();
}
