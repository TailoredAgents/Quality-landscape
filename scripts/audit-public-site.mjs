import { chromium } from "@playwright/test";
import fs from "node:fs/promises";

const origin = new URL(process.argv[2] || "http://localhost:3107").origin;
const browser = await chromium.launch();
const page = await browser.newPage({ javaScriptEnabled: false });
const results = [];
try {
  for (const route of [
    "/",
    "/services",
    "/our-work",
    "/about",
    "/contact",
    "/privacy",
  ]) {
    const response = await page.goto(`${origin}${route}`, {
      waitUntil: "domcontentloaded",
    });
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    const headings = await page.locator("h1").count();
    const title = await page.title();
    const missingAlt = await page.locator("img:not([alt])").count();
    if (
      response.status() !== 200 ||
      new URL(canonical, origin).href !== new URL(route, origin).href ||
      !description ||
      !title ||
      headings !== 1 ||
      missingAlt
    ) {
      throw new Error(
        `SEO check failed at ${route}: status=${response.status()}, canonical=${canonical}, h1=${headings}, missingAlt=${missingAlt}`,
      );
    }
    results.push({
      route,
      status: response.status(),
      title,
      canonical,
      description,
      headings,
      missingAlt,
      robots: await page.locator('meta[name="robots"]').getAttribute("content"),
      robotsHeader: response.headers()["x-robots-tag"] || null,
    });
  }
  await page.goto(`${origin}/admin/login`, { waitUntil: "domcontentloaded" });
  if (
    !(
      await page.locator('meta[name="robots"]').getAttribute("content")
    ).includes("noindex")
  )
    throw new Error("Private login must remain excluded from search.");
  await fs.mkdir(".data/performance", { recursive: true });
  await fs.writeFile(
    `.data/performance/seo-${new URL(origin).hostname}.json`,
    JSON.stringify(
      {
        origin,
        checkedAt: new Date().toISOString(),
        results,
        privateLoginNoindex: true,
      },
      null,
      2,
    ),
  );
  console.log(
    `Passed server-rendered SEO checks on six public pages at ${origin}; private login remains noindex.`,
  );
  console.log(
    `Public indexing is currently ${results.some((p) => p.robots?.includes("noindex")) ? "disabled" : "enabled"}.`,
  );
} finally {
  await browser.close();
}
