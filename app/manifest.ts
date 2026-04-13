import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "See You Wild 西揪團",
    short_name: "See You Wild",
    description: "台灣戶外探險品牌 — 山海之間・野放靈魂",
    start_url: "/",
    display: "standalone",
    background_color: "#38464E",
    theme_color: "#38464E",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
