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
  variant: "solid" | "ghost";
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
