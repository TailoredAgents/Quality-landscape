import { chromium } from "@playwright/test";
import fs from "node:fs";
const credentials = fs.readFileSync(".data/admin-access.txt", "utf8");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 430, height: 900 } });
await page.goto("http://localhost:3107/admin/login");
await page
  .getByLabel("Email address")
  .fill(credentials.match(/Email: (.+)/)[1]);
await page
  .getByLabel("Password", { exact: true })
  .fill(credentials.match(/Password: (.+)/)[1]);
await page.getByRole("button", { name: "Sign in securely" }).click();
await page.getByText("Total pageviews", { exact: true }).waitFor();
console.log(
  await page.evaluate(() =>
    [...document.querySelectorAll("body *")]
      .map((e) => ({
        tag: e.tagName,
        class: e.className,
        left: e.getBoundingClientRect().left,
        right: e.getBoundingClientRect().right,
        width: e.getBoundingClientRect().width,
      }))
      .filter((e) => e.right > innerWidth + 2 && e.width > 0),
  ),
);
await browser.close();
