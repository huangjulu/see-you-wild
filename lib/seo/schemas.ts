import { INSTAGRAM_URL, SITE_URL } from "@/lib/constants";
import type { Locale } from "@/lib/i18n";

async function getSeoData(locale: Locale) {
  switch (locale) {
    case "en":
      return (await import("./en")).seoData;
    case "zh-TW":
    default:
      return (await import("./zh-TW")).seoData;
  }
}

export async function getLocalBusinessSchema(locale: Locale) {
  const data = await getSeoData(locale);
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: data.business.name,
    description: data.business.description,
    url: SITE_URL,
    image: `${SITE_URL}/images/og-image.jpg`,
    sameAs: [INSTAGRAM_URL],
    areaServed: {
      "@type": "Country",
      name: data.business.areaServed,
    },
    serviceType: data.business.serviceType,
  };
}

export async function getEventSchemas(locale: Locale) {
  const data = await getSeoData(locale);
  return data.events.map((event) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    organizer: {
      "@type": "Organization",
      name: data.business.name,
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      url: event.offerUrl,
      availability: event.availability,
    },
    location: {
      "@type": "Place",
      name: event.locationName,
      address: {
        "@type": "PostalAddress",
        addressCountry: "TW",
      },
    },
  }));
}
