import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Logic Gym 謎題本",
    short_name: "謎題本",
    description: "給幼稚園到小四的互動邏輯謎題：數織、一筆畫、數獨。",
    start_url: "/play",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#e6f0ff",
    theme_color: "#e6f0ff",
    lang: "zh-Hant",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
