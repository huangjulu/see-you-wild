/**
 * 用 B 的 key 覆蓋 A 的同名屬性。
 * ModalCard / DialogCard 的 SlotProps 用這個收窄 Slot 的泛用 slot: string → 具體 union。
 */
export type Override<A, B> = Omit<A, keyof B> & B;

export interface Event {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  cta: string;
  ctaUrl: string;
  image: string;
  imageAlt: string;
  theme: "solid" | "ghost";
}

export interface EventsApiResponse {
  data: Event[];
  meta: {
    total: number;
    source: string;
  };
}

export interface EventApiResponse {
  data: Event;
  meta: {
    source: string;
  };
}

export interface ApiError {
  error: string;
  status: number;
}
