import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date("2026-04-13"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
