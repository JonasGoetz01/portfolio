import type { MetadataRoute } from "next";

import { content } from "@/lib/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${content.hero.name} — Portfolio`,
    short_name: content.hero.name,
    description: content.meta.description,
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
