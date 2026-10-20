import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/fraunces";
import "./globals.css";
import { siteUrl, previewMode } from "@/lib/config";
import { business } from "@/lib/business";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Quality Landscape & More | Vidalia, Georgia",
    template: "%s | Quality Landscape & More",
  },
  description:
    "Thoughtful lawn maintenance and property care in Vidalia, Georgia.",
  robots:
    previewMode || !business.approvedForLaunch
      ? { index: false, follow: false }
      : undefined,
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
