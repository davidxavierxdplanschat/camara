import type { MetadataRoute } from "next";
import { branding } from "@/config/branding";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: branding.siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
