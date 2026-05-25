// Non-text configuration — display text lives in lib/dictionary/

import type { ButtonTheme } from "@/components/ui/atoms/button.types";

export const SITE_URL = "https://seeyouwild.com";

export const INSTAGRAM_URL =
  "https://www.instagram.com/c_you_wild?igsh=MTZ5eXU1aWNna3Zqdw==";
export const INSTAGRAM_HANDLE = "@c_you_wild";

export const LINE_OA_URL = "https://line.me/R/ti/p/@427qyovq";
export const CONTACT_EMAIL = "seeyouwild.tw@gmail.com";

interface EventConfig {
  id: string;
  image: string;
  ctaUrl: string;
  theme: ButtonTheme;
}

export const EVENTS_CONFIG: EventConfig[] = [
  {
    id: "camping-chef",
    image: "/images/event-camping.jpg",
    ctaUrl: "https://forms.gle/kdXfmR7BXqijwkY46",
    theme: "solid",
  },
  {
    id: "hot-spring",
    image: "/images/event-hotspring.jpg",
    ctaUrl: "https://seeyouwild.my.canva.site/march-hotspring",
    theme: "ghost",
  },
];

export const PICKUP_LOCATIONS = [
  "大坪林捷運站",
  "南港捷運站",
  "台北車站",
  "板橋捷運站",
  "三重捷運站",
] as const;

export const NAV_LINKS = {
  about: "/#about",
};
