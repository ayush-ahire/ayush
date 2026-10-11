import type { MetadataRoute } from "next";

import { SITE_URL } from "@/data/site";

/**
 * sitemap.xml
 *
 * The site is a single page, so there is exactly one URL. `lastModified` is
 * derived at build time rather than hardcoded, so a redeploy with content
 * changes is reflected honestly.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}