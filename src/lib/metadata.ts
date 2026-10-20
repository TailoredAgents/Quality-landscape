import type { Metadata } from "next";
import { previewMode, siteUrl } from "./config";
import { business } from "./business";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    robots:
      previewMode || !business.approvedForLaunch
        ? { index: false, follow: false }
        : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: new URL(path, siteUrl).toString(),
      type: "website",
      locale: "en_US",
      siteName: "Quality Landscape & More",
      images: [
        {
          url: "/images/property.jpg",
          width: 1600,
          height: 1067,
          alt: "Residential landscape",
        },
      ],
    },
  };
}
