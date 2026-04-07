import { getTranslations as _getTranslations } from "next-intl/server";
import type { MessageNamespace, TranslationFunction } from "./types";

export async function getTranslations<NS extends MessageNamespace>(
  namespace: NS
): Promise<TranslationFunction<NS>> {
  // next-intl 的 t() 回傳 opaque internal type，
  // 無法透過 generic constraint 與 TranslationFunction 對接，
  // 此處是兩套型別系統的唯一橋接點。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (await _getTranslations(
    namespace
  )) as unknown as TranslationFunction<NS>;
}
