import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, INSTAGRAM_URL } from "./constants";

export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    image: `${SITE_URL}/images/og-image.jpg`,
    sameAs: [INSTAGRAM_URL],
    areaServed: {
      "@type": "Country",
      name: "Taiwan",
    },
    serviceType: [
      "戶外探險活動",
      "野營私廚",
      "野溪溫泉",
      "SUP 立槳",
      "攀樹體驗",
    ],
  };
}

export function getEventSchemas() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Event",
      name: "野營私廚・專屬預約席",
      description: "營火晚宴 × SUP立槳 × 攀樹體驗。限量席次，專屬於你的野奢體驗。",
      startDate: "2025-03-14",
      endDate: "2025-03-15",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      organizer: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
      offers: {
        "@type": "Offer",
        url: "https://forms.gle/kdXfmR7BXqijwkY46",
        availability: "https://schema.org/LimitedAvailability",
      },
      location: {
        "@type": "Place",
        name: "台灣",
        address: {
          "@type": "PostalAddress",
          addressCountry: "TW",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Event",
      name: "秘境野溪溫泉",
      description: "專業教練帶領，深入台灣秘境野溪溫泉。安全戒護、專業裝備。",
      startDate: "2025-03-01",
      endDate: "2025-03-31",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      organizer: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
      offers: {
        "@type": "Offer",
        url: "https://seeyouwild.my.canva.site/march-hotspring",
        availability: "https://schema.org/InStock",
      },
      location: {
        "@type": "Place",
        name: "台灣秘境野溪",
        address: {
          "@type": "PostalAddress",
          addressCountry: "TW",
        },
      },
    },
  ];
}
