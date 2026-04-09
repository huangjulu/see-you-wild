// Non-text configuration — display text lives in lib/dictionary/

export const SITE_URL = "https://seeyouwild.com";

export const INSTAGRAM_URL =
  "https://www.instagram.com/c_you_wild?igsh=MTZ5eXU1aWNna3Zqdw==";
export const INSTAGRAM_HANDLE = "@c_you_wild";

export const EVENTS_CONFIG = [
  {
    id: "camping-chef",
    image: "/images/event-camping.jpg",
    ctaUrl: "https://forms.gle/kdXfmR7BXqijwkY46",
    theme: "solid" as const,
  },
  {
    id: "hot-spring",
    image: "/images/event-hotspring.jpg",
    ctaUrl: "https://seeyouwild.my.canva.site/march-hotspring",
    theme: "ghost" as const,
  },
];

export const PRIVATE_GROUP_CTA_URL =
  "https://www.instagram.com/c_you_wild?igsh=cGE3aGl0MGJvOTFt";

export const NAV_ANCHORS = {
  events: "#events",
  privateGroup: "#private-group",
  contact: "#contact",
};
