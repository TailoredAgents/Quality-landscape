import { webkit } from "@playwright/test";
import fs from "node:fs/promises";

const origin = process.argv[2] || "http://localhost:3107";
const browser = await webkit.launch();
const errors = [];
const results = [];
try {
  for (const { width, height } of [
    { width: 375, height: 812 },
    { width: 430, height: 932 },
    { width: 320, height: 700 },
    { width: 844, height: 390 },
  ]) {
    for (const route of [
      "/",
      "/services",
      "/our-work",
      "/about",
      "/contact",
      "/privacy",
    ]) {
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      });
      const page = await context.newPage();
      page.on("pageerror", (e) => errors.push(e.message));
      const response = await page.goto(origin + route, {
        waitUntil: "networkidle",
      });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      // WebKit exposes the conditional 304 for revisited pages; the document
      // is correctly rendered from its validated cache in that case.
      if (
        ![200, 304].includes(response.status()) ||
        overflow ||
        (await page.locator("h1").count()) !== 1
      )
        throw new Error(
          `WebKit failed ${width} ${route}, status ${response.status()}, overflow ${overflow}`,
        );
      if (route === "/" && width < 701) {
        const hero = page.locator(".home-hero");
        const before = await hero.evaluate(
          (e) => e.getBoundingClientRect().height,
        );
        await page.evaluate(() =>
          window.scrollTo({ top: 850, behavior: "instant" }),
        );
        await page.setViewportSize({ width, height: height + 100 });
        const after = await hero.evaluate(
          (e) => e.getBoundingClientRect().height,
        );
        if (Math.abs(after - before) > 1)
          throw new Error(`WebKit hero shifted at ${width}`);
        await page.setViewportSize({ width, height });
      }
      results.push({
        width,
        height,
        route,
        status: response.status(),
        overflow,
      });
      await context.close();
    }
  }
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin + "/");
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  if (
    !(await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .isVisible())
  )
    throw new Error("WebKit mobile menu did not open");
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: /Contact/ })
    .click();
  await page.waitForURL("**/contact");
  await page.getByLabel("Full name").waitFor();
  await page.getByLabel("Full name").fill("Mobile review");
  if (
    !(await page.getByLabel("Full name").inputValue()).includes("Mobile review")
  )
    throw new Error("WebKit form input failed");
  if (errors.length)
    throw new Error(`WebKit browser errors: ${errors.join("; ")}`);
  await fs.mkdir(".data/mobile-review", { recursive: true });
  await fs.writeFile(
    ".data/mobile-review/webkit-results.json",
    JSON.stringify({ results, errors, menuAndForm: "passed" }, null, 2),
  );
  console.log(
    `WebKit: ${results.length} route/viewport checks, stable hero, menu navigation and form input passed.`,
  );
} finally {
  await browser.close();
}
