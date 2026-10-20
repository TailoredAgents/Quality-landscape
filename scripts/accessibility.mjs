import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const report = [];
for (const path of [
  "/",
  "/services",
  "/our-work",
  "/about",
  "/contact",
  "/privacy",
  "/admin/login",
  "/admin",
]) {
  await page.goto("http://localhost:3107" + path);
  if (path === "/admin") {
    const c = fs.readFileSync(".data/admin-access.txt", "utf8");
    await page.getByLabel("Email address").fill(c.match(/Email: (.+)/)[1]);
    await page
      .getByLabel("Password", { exact: true })
      .fill(c.match(/Password: (.+)/)[1]);
    await page.getByRole("button", { name: "Sign in securely" }).click();
    await page.getByText("Total pageviews", { exact: true }).waitFor();
  }
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  report.push({
    path,
    violations: result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
}
fs.writeFileSync("qa/accessibility.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
