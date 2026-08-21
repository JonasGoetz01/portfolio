import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  return {
    // /admin is a sign-in and an editor; there is nothing there to index.
    rules: [{ userAgent: "*", allow: "/", disallow: "/admin" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
