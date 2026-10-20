import { chromium } from "@playwright/test";
import fs from "node:fs";
const credentials = fs.readFileSync(".data/admin-access.txt", "utf8");
const email = credentials.match(/Email: (.+)/)[1];
const password = credentials.match(/Password: (.+)/)[1];
const browser = await chromium.launch({ headless: true });
for (const width of [1440, 768, 430, 375]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:3107/admin/login", {
    waitUntil: "networkidle",
  });
  await page.screenshot({
    path: `qa/screenshots/login-${width}.png`,
    fullPage: true,
  });
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await page
    .getByText("Sample Data — Illustrative Dashboard Preview", { exact: true })
    .waitFor();
  await page.getByText("Total pageviews", { exact: true }).waitFor();
  await page.screenshot({
    path: `qa/screenshots/dashboard-${width}.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Website traffic", exact: true })
    .click();
  await page.screenshot({
    path: `qa/screenshots/traffic-${width}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: /^Inquiries/ }).click();
  await page.screenshot({
    path: `qa/screenshots/inquiries-${width}.png`,
    fullPage: true,
  });
  console.log(
    width,
    "Dashboard overflow",
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    "Errors:",
    errors,
  );
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.close();
}
await browser.close();
