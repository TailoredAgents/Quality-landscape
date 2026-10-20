import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
import sharp from "sharp";

const stage = process.argv[2] || "review";
const origin = process.argv[3] || "http://localhost:3107";
const directory = `.data/mobile-review/${stage}`;
await fs.mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [375, 430, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const route of [
      "/",
      "/services",
      "/our-work",
      "/about",
      "/contact",
      "/privacy",
    ]) {
      const response = await page.goto(origin + route, {
        waitUntil: "networkidle",
      });
      const decline = page.getByRole("button", {
        name: "Decline",
        exact: true,
      });
      if (await decline.isVisible()) await decline.click();
      for (const picture of await page.locator("main img, footer img").all()) {
        await picture.scrollIntoViewIfNeeded();
        await picture.evaluate((image) => image.decode().catch(() => {}));
      }
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          document.getAnimations().map((a) => a.finished.catch(() => {})),
        );
        window.scrollTo({ top: 0, behavior: "instant" });
      });
      const name = route === "/" ? "home" : route.slice(1);
      const file = `${directory}/${name}-${width}.png`;
      await page.screenshot({ path: file, fullPage: true });
      const metrics = await page.evaluate(() => {
        const visible = (el) =>
          el.getClientRects().length &&
          getComputedStyle(el).visibility !== "hidden";
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          smallCopy: [
            ...document.querySelectorAll(
              "main p, main li, main summary, .field > span, .check-label, .footer-top a, .footer-brand > p",
            ),
          ]
            .filter(visible)
            .map((el) => ({
              text: el.textContent.trim().slice(0, 75),
              size: Number.parseFloat(getComputedStyle(el).fontSize),
              selector: el.className || el.tagName,
            }))
            .filter((el) => el.size < 14),
          brokenImages: [...document.images]
            .filter((i) => !i.complete || !i.naturalWidth)
            .map((i) => i.alt),
          formFonts: [
            ...document.querySelectorAll(
              ".quote-form input:not([type=checkbox]), .quote-form textarea, .quote-form select",
            ),
          ]
            .filter(visible)
            .map((e) => ({ name: e.name, size: getComputedStyle(e).fontSize })),
        };
      });
      let violations = [];
      if (width === 375) {
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        violations = axe.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        }));
        const metadata = await sharp(file).metadata();
        const slice = 1400;
        const inputs = await Promise.all(
          Array.from(
            { length: Math.ceil(metadata.height / slice) },
            async (_, i) => ({
              input: await sharp(file)
                .extract({
                  left: 0,
                  top: i * slice,
                  width,
                  height: Math.min(slice, metadata.height - i * slice),
                })
                .png()
                .toBuffer(),
              left: i * width,
              top: 0,
            }),
          ),
        );
        await sharp({
          create: {
            width: width * inputs.length,
            height: slice,
            channels: 3,
            background: "#f6f4ed",
          },
        })
          .composite(inputs)
          .png()
          .toFile(`${directory}/${name}-montage.png`);
      }
      results.push({
        width,
        route,
        status: response.status(),
        ...metrics,
        violations,
        errors: [...errors],
      });
      console.log(
        `${width} ${route}: overflow=${metrics.overflow}, smallCopy=${metrics.smallCopy.length}, accessibility=${violations.length}`,
      );
    }
    await context.close();
  }
  await fs.writeFile(
    `${directory}/results.json`,
    JSON.stringify(results, null, 2),
  );
} finally {
  await browser.close();
}
