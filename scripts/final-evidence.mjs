import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
await page.goto("http://localhost:3107", { waitUntil: "networkidle" });
if (
  await page.getByRole("button", { name: "Decline", exact: true }).isVisible()
)
  await page.getByRole("button", { name: "Decline", exact: true }).click();
await page.screenshot({ path: "qa/preview.png" });
await page.setViewportSize({ width: 375, height: 900 });
await page.goto("http://localhost:3107/contact", { waitUntil: "networkidle" });
await page.screenshot({ path: "qa/contact-mobile-final.png" });
console.log(
  "Small-phone contact decoration hidden:",
  !(await page.locator(".contact-heading h1 svg").isVisible()),
);
await page.goto("http://localhost:3107/services", { waitUntil: "networkidle" });
await page.locator(".service-intro").scrollIntoViewIfNeeded();
await page.screenshot({ path: "qa/services-mobile-final.png" });
console.log(
  "Small-phone service headline:",
  await page
    .locator(".service-intro h2")
    .evaluate((e) => getComputedStyle(e).fontSize),
);
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto("http://localhost:3107/admin/login", {
  waitUntil: "networkidle",
});
const access = await fs.readFile(".data/admin-access.txt", "utf8");
await page.getByLabel("Email address").fill(access.match(/Email: (.+)/)[1]);
await page
  .getByLabel("Password", { exact: true })
  .fill(access.match(/Password: (.+)/)[1]);
await page.getByRole("button", { name: "Sign in securely" }).click();
await page.getByText("Total pageviews", { exact: true }).waitFor();
await page.waitForLoadState("networkidle");
await page.screenshot({ path: "qa/dashboard-preview.png" });
await page.getByRole("button", { name: "Sign out", exact: true }).click();
await browser.close();
