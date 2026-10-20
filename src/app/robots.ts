import type { MetadataRoute } from "next";
import { previewMode, siteUrl } from "@/lib/config";
import { business } from "@/lib/business";
export default function robots(): MetadataRoute.Robots {
  return previewMode || !business.approvedForLaunch
    ? { rules: { userAgent: "*", disallow: "/" } }
    : {
        rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
        sitemap: `${siteUrl}/sitemap.xml`,
      };
}
