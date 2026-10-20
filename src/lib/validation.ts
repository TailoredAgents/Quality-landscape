import { z } from "zod";
import { services } from "./business";
const clean = (max: number) =>
  z.string().trim().min(2, "Please enter at least 2 characters.").max(max);
export const quoteSchema = z.object({
  name: clean(100),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .max(30)
    .refine(
      (v) => /^[+()\d\s.\-]+$/.test(v) && v.replace(/\D/g, "").length >= 7,
      "Please enter a valid phone number.",
    ),
  email: z.email("Please enter a valid email address.").max(254),
  service: z
    .string()
    .refine(
      (s) =>
        [...services.map((s) => s.title), "Not sure — let’s discuss"].includes(
          s,
        ),
      "Please select a service.",
    ),
  location: clean(200),
  message: z
    .string()
    .trim()
    .min(10, "Please share at least 10 characters.")
    .max(3000),
  consent: z.literal("yes", {
    error: "Please agree so the business can respond.",
  }),
  website: z.string().max(0).optional(),
});
export const publicPaths = [
  "/",
  "/services",
  "/our-work",
  "/about",
  "/contact",
  "/privacy",
];
export const analyticsSchema = z.object({
  consent: z.literal("accepted"),
  kind: z.enum(["pageview", "engagement"]),
  path: z.enum(publicPaths as [string, ...string[]]),
  visitor: z.uuid(),
  session: z.uuid(),
  referrer: z.string().max(2048).default(""),
  utmSource: z.string().max(80).default(""),
  utmMedium: z.string().max(80).default(""),
  utmCampaign: z.string().max(120).default(""),
  device: z.enum(["mobile", "tablet", "desktop"]),
  duration: z.number().int().min(0).max(1800).optional(),
});
export function safeCampaign(value: string) {
  return /^[\w .-]{1,120}$/.test(value) && !/@|\d{7,}/.test(value) ? value : "";
}
export function referralSource(referrer: string, ownOrigin: string) {
  try {
    const url = new URL(referrer);
    if (!["http:", "https:"].includes(url.protocol)) return "Direct";
    return url.origin === ownOrigin
      ? "Direct"
      : url.hostname
          .toLowerCase()
          .replace(/^www\./, "")
          .slice(0, 150);
  } catch {
    return "Direct";
  }
}
