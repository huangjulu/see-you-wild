export const SITE_NAME = "See You Wild 西揪團";
export const SITE_TAGLINE = "山海之間・野放靈魂";
export const SITE_DESCRIPTION =
  "See You Wild 西揪團 — 台灣戶外探險品牌，提供野營私廚、野溪溫泉、SUP 立槳、攀樹體驗等活動。山海之間・野放靈魂。";
export const SITE_URL = "https://seeyouwild.com";

export const INSTAGRAM_URL =
  "https://www.instagram.com/c_you_wild?igsh=MTZ5eXU1aWNna3Zqdw==";
export const INSTAGRAM_HANDLE = "@c_you_wild";

export const EVENTS = [
  {
    id: "camping-chef",
    tag: "限定企劃",
    title: "野營私廚・專屬預約席",
    subtitle: "營火晚宴 × SUP立槳 × 攀樹體驗",
    date: "03/14-15",
    description:
      "在星空下享受私廚料理，白天挑戰 SUP 立槳與攀樹體驗。限量席次，專屬於你的野奢體驗。",
    cta: "立即預約",
    ctaUrl: "https://forms.gle/kdXfmR7BXqijwkY46",
    image: "/images/event-camping.jpg",
    imageAlt: "夜間營火晚宴帳篷場景，串燈裝飾營造溫馨氛圍",
    variant: "solid" as const,
  },
  {
    id: "hot-spring",
    tag: "常態行程",
    title: "秘境野溪溫泉",
    subtitle: "專業教練與安全戒護",
    date: "三月份",
    description:
      "由專業教練帶領，深入台灣秘境野溪溫泉。安全戒護、專業裝備，讓你安心享受大自然的溫泉饗宴。",
    cta: "了解更多",
    ctaUrl: "https://seeyouwild.my.canva.site/march-hotspring",
    image: "/images/event-hotspring.jpg",
    imageAlt: "野溪溫泉場景，溪水與岩石間冒出天然溫泉",
    variant: "ghost" as const,
  },
];

export const PRIVATE_GROUP = {
  title: "摯友微包團",
  subtitle: "4人即刻成行・日期你決定",
  description:
    "揪好友、選日期，專屬於你們的戶外冒險。4 人即可成團，行程客製化，給你最自由的野放體驗。",
  cta: "立即諮詢",
  ctaUrl: "https://www.instagram.com/c_you_wild?igsh=cGE3aGl0MGJvOTFt",
};

export const NAV_LINKS = [
  { label: "活動行程", href: "#events" },
  { label: "包團諮詢", href: "#private-group" },
  { label: "聯絡我們", href: "#contact" },
];
