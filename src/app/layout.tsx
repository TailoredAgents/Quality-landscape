import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { siteUrl, previewMode } from "@/lib/config";
import { business } from "@/lib/business";
const manrope = localFont({
  src: "../../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  variable: "--font-manrope",
  weight: "200 800",
  display: "swap",
  adjustFontFallback: "Arial",
});
const fraunces = localFont({
  src: "../../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2",
  variable: "--font-fraunces",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${fraunces.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
