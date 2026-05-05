import type messages from "@/messages/zh-TW.json";

/** 以 zh-TW.json 為 single source of truth 推導完整訊息型別 */
export type Messages = typeof messages;

/** 取得巢狀物件中指定 dot-path 的子型別 */
type GetNested<T, K extends string> = K extends `${infer F}.${infer R}`
  ? F extends keyof T
    ? GetNested<T[F], R>
    : never
  : K extends keyof T
    ? T[K]
    : never;

/** 列舉所有指向「非葉節點」的 dot-path，即合法 namespace */
type NamespacePaths<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ?
        | (P extends "" ? K : `${P}.${K}`)
        | NamespacePaths<T[K], P extends "" ? K : `${P}.${K}`>
    : never;
}[keyof T & string];

/** 列舉所有指向「葉節點 string」的 dot-path，即合法翻譯 key */
type LeafKeys<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? LeafKeys<T[K], P extends "" ? K : `${P}.${K}`>
    : P extends ""
      ? K
      : `${P}.${K}`;
}[keyof T & string];

/** 合法的 namespace 字串（如 "common", "home.events", "common.error"） */
export type MessageNamespace = NamespacePaths<Messages>;

/** 給定 namespace 後，該層級下可用的翻譯 key */
export type MessageKey<NS extends MessageNamespace> = LeafKeys<
  GetNested<Messages, NS>
>;

/** 型別安全的翻譯函式簽章 — 支援靜態 key 自動補全 + 動態 key fallback + ICU values */
export interface TranslationFunction<NS extends MessageNamespace> {
  (key: MessageKey<NS>, values?: Record<string, string | number>): string;
  (key: string & {}, values?: Record<string, string | number>): string;
}
