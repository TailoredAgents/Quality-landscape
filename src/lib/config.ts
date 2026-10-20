export const previewMode = process.env.PREVIEW_MODE !== "false";
export const siteUrl =
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3107";
