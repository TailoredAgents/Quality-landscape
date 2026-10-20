import { resolveSiteUrl } from "./site-url";

export const previewMode = process.env.PREVIEW_MODE !== "false";
export const siteUrl = resolveSiteUrl(process.env);
