export const publicPaths = [
  "/",
  "/services",
  "/our-work",
  "/about",
  "/contact",
  "/privacy",
];
export function safeCampaign(value: string) {
  return /^[\w .-]{1,120}$/.test(value) && !/@|\d{7,}/.test(value) ? value : "";
}
