import type { MetadataRoute } from "next";
import { previewMode, siteUrl } from "@/lib/config";
import { business } from "@/lib/business";
export default function sitemap(): MetadataRoute.Sitemap {
  return previewMode || !business.approvedForLaunch
    ? []
    : ["/", "/services", "/our-work", "/about", "/contact"].map((p) => ({
        url: new URL(p, siteUrl).toString(),
        changeFrequency: "monthly",
        priority: p === "/" ? 1 : 0.8,
      }));
}
