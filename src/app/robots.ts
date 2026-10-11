import type { MetadataRoute } from "next";

import { SITE_URL } from "@/data/site";

/**
 * robots.txt
 *
 * The whole site is public and worth indexing. `/api/*` is disallowed because
 * those routes return JSON responses with no crawlable content — blocking
 * them saves crawler budget and keeps them out of search results.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}