type SiteEnvironment = {
  [key: string]: string | undefined;
  SITE_URL?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  RENDER_EXTERNAL_URL?: string;
  RENDER?: string;
};

export function resolveSiteUrl(environment: SiteEnvironment): string {
  for (const candidate of [
    environment.SITE_URL,
    environment.NEXT_PUBLIC_SITE_URL,
    environment.RENDER_EXTERNAL_URL,
  ]) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (!["http:", "https:"].includes(url.protocol)) continue;
      // A copied local setting must never become the canonical origin on Render.
      if (
        environment.RENDER === "true" &&
        /^(localhost|127\..*|\[::1\])$/i.test(url.hostname)
      )
        continue;
      return url.origin;
    } catch {
      // Try the hosting provider's public origin if a custom value is malformed.
    }
  }
  if (environment.RENDER === "true") {
    throw new Error(
      "Set a public SITE_URL or NEXT_PUBLIC_SITE_URL for the Render deployment.",
    );
  }
  return "http://localhost:3107";
}
