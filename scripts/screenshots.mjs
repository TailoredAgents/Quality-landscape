import { chromium } from "@playwright/test";
import fs from "node:fs";
const browser = await chromium.launch({ headless: true });
fs.mkdirSync("qa/screenshots", { recursive: true });
for (const width of [1440, 768, 430, 375]) {
  const page = await browser.newPage({
    viewport: { width, height: width === 1440 ? 1000 : 900 },
    deviceScaleFactor: 1,
  });
  for (const path of ["/", "/services", "/our-work", "/about", "/contact"]) {
    await page.goto("http://localhost:3107" + path, {
      waitUntil: "networkidle",
    });
    await page.evaluate(() => document.fonts.ready);
    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `qa/screenshots/${path === "/" ? "home" : path.slice(1)}-${width}.png`,
      fullPage: true,
    });
    console.log(
      width,
      path,
      await page.title(),
      await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        images: [...document.images]
          .filter((i) => !i.complete || i.naturalWidth === 0)
          .map((i) => i.alt),
      })),
    );
  }
  await page.close();
}
await browser.close();
