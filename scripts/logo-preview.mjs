import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
});
await page.goto("http://localhost:3107/", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Decline", exact: true }).click();
await page.locator(".site-header").screenshot({ path: "qa/logo-header.png" });
await page.screenshot({ path: "qa/preview.png" });
await page
  .locator(".brand")
  .first()
  .evaluate((el) => {
    for (const sibling of el.parentElement.children) {
      if (sibling !== el) sibling.style.visibility = "hidden";
    }
    el.style.padding = "32px";
    el.style.background = "#F6F4ED";
    el.style.transformOrigin = "top left";
    el.style.zoom = "2";
  });
await page.locator(".brand").first().screenshot({ path: "qa/logo-new.png" });
await page.reload({ waitUntil: "networkidle" });
await page.locator("footer .brand").screenshot({ path: "qa/logo-footer.png" });
for (const width of [1440, 768, 375]) {
  await page.setViewportSize({ width, height: 900 });
  for (const route of [
    "/",
    "/about",
    "/services",
    "/our-work",
    "/contact",
    "/admin/login",
  ]) {
    await page.goto(`http://localhost:3107${route}`, {
      waitUntil: "networkidle",
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    if (overflow) throw new Error(`Horizontal overflow at ${width}: ${route}`);
    const mark = page.locator(".brand > svg").first();
    if (!(await mark.isVisible()))
      throw new Error(`Missing logo at ${width}: ${route}`);
    if (route === "/" && width === 375)
      await page.screenshot({ path: "qa/logo-mobile.png" });
  }
}
const oldLogo = (await fs.readFile("design/logo-original/logo.png")).toString(
  "base64",
);
const newLogo = (await fs.readFile("qa/logo-new.png")).toString("base64");
await page.setViewportSize({ width: 1120, height: 660 });
await page.setContent(
  `<style>body{margin:0;background:#F6F4ED;font:12px Arial;color:#193D32}section{padding:25px 30px;border-bottom:1px solid #dedfd3}p{letter-spacing:2px;margin:0 0 12px}img{display:block;width:650px;max-width:100%;height:220px;object-fit:contain;object-position:left center}</style><section><p>NEW · GRASS Q</p><img src="data:image/png;base64,${newLogo}"></section><section><p>ORIGINAL · SAVED</p><img src="data:image/png;base64,${oldLogo}"></section>`,
);
await page.screenshot({ path: "qa/logo-comparison.png" });
console.log(
  "Logo visible, no horizontal overflow: six routes at 1440, 768, and 375px. Original logo saved.",
);
await browser.close();
