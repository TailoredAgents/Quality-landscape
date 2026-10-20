import { test, expect } from "@playwright/test";
import fs from "node:fs";
import AxeBuilder from "@axe-core/playwright";
const credentials = fs.readFileSync(".data/admin-access.txt", "utf8");
async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page
    .getByLabel("Email address")
    .fill(credentials.match(/Email: (.+)/)![1]);
  await page
    .getByLabel("Password", { exact: true })
    .fill(credentials.match(/Password: (.+)/)![1]);
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await expect(
    page.getByText("Total pageviews", { exact: true }),
  ).toBeVisible();
}
test("all public pages render at desktop, tablet, and phone sizes", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [1440, 768, 430, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/services",
      "/our-work",
      "/about",
      "/contact",
      "/privacy",
    ]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("body")).not.toContainText(
        /personalized website|website concept|sales preview|demonstration|pending owner|after owner approval|reserved for|proposed service/i,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      for (const image of await page.locator("img").all()) {
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty("complete", true);
        expect(
          await image.evaluate((i) => (i as HTMLImageElement).naturalWidth),
        ).toBeGreaterThan(0);
      }
      expect(
        await page
          .locator("img")
          .evaluateAll((imgs) =>
            imgs.every(
              (i) =>
                (i as HTMLImageElement).complete &&
                (i as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      ).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});
test("mobile hero stays stable when browser controls change the viewport height", async ({
  page,
}) => {
  for (const width of [375, 390, 430, 700]) {
    await page.setViewportSize({ width, height: 760 });
    await page.goto("/", { waitUntil: "networkidle" });
    const hero = page.locator(".home-hero");
    const measure = () =>
      hero.evaluate((element) => ({
        height: element.getBoundingClientRect().height,
        nextTop:
          element.nextElementSibling!.getBoundingClientRect().top +
          window.scrollY,
      }));
    const before = await measure();
    await page.evaluate(() =>
      window.scrollTo({ top: 850, behavior: "instant" }),
    );
    await page.setViewportSize({ width, height: 890 });
    const expanded = await measure();
    expect(expanded.height).toBeCloseTo(before.height, 0);
    expect(expanded.nextTop).toBeCloseTo(before.nextTop, 0);
    await page.setViewportSize({ width, height: 700 });
    const collapsed = await measure();
    expect(collapsed.height).toBeCloseTo(before.height, 0);
    expect(collapsed.nextTop).toBeCloseTo(before.nextTop, 0);
  }
});

test("mobile menu navigates and closes accessibly", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 850 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(
    page.getByRole("button", { name: "Close menu" }),
  ).toHaveAttribute("aria-expanded", "true");
  await page
    .locator("#mobile-menu")
    .getByRole("link", { name: "Services", exact: false })
    .click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.locator("#mobile-menu")).toHaveCount(0);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-menu")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  await expect(
    page.getByRole("link", { name: /^Call Quality Landscape/ }),
  ).toHaveAttribute("href", "tel:+19125853450");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.mouse.click(20, 820);
  await expect(page.locator("#mobile-menu")).toHaveCount(0);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("link", { name: "Quality Landscape & More home" })
    .first()
    .click();
  await expect(page.locator("#mobile-menu")).toHaveCount(0);
});
test("gallery filters and lightbox work with keys and touch buttons", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/our-work");
  await page.getByRole("button", { name: "Details", exact: true }).click();
  await expect(page.locator(".gallery-item")).toHaveCount(2);
  await page.locator(".gallery-item").first().click();
  await expect(page.locator("dialog")).toBeVisible();
  for (const name of ["Close photo", "Previous photo", "Next photo"]) {
    const button = page.getByRole("button", { name });
    await expect(button).toBeVisible();
    const bounds = await button.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(700);
  }
  await expect(page.locator(".lightbox-controls")).toContainText("1 / 2");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".lightbox-controls")).toContainText("2 / 2");
  await page.getByRole("button", { name: "Previous photo" }).click();
  await expect(page.locator(".lightbox-controls")).toContainText("1 / 2");
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).not.toBeVisible();
  await expect(page.locator(".gallery-item").first()).toBeFocused();
});
test("estimate form validates and confirms a saved inquiry", async ({
  page,
}) => {
  await page.goto("/contact?service=Lawn%20Maintenance");
  await expect(page.getByLabel("Service requested")).toHaveValue(
    "Lawn Maintenance",
  );
  await page
    .locator("form")
    .getByRole("button", { name: "Request an Estimate" })
    .click();
  expect(
    await page
      .getByLabel("Full name")
      .evaluate((i) => (i as HTMLInputElement).validity.valueMissing),
  ).toBe(true);
  await page.getByLabel("Full name").fill("Browser Test");
  await page.getByLabel("Phone number").fill("(912) 555-0100");
  await page.getByLabel("Email address").fill("browser-test@example.com");
  await page.getByLabel("Property location").fill("Example property, Vidalia");
  await page
    .getByLabel("Tell us about your property")
    .fill("Testing this demonstration inquiry safely.");
  await page.getByRole("checkbox").check();
  // Verify client feedback without inserting fictional contacts in the business database.
  // Real persistence is exercised separately in the isolated backend integration suite.
  await page.route("**/api/quotes", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, stored: true, emailSent: false }),
    }),
  );
  await page
    .locator("form")
    .getByRole("button", { name: "Request an Estimate" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your request is received." }),
  ).toBeVisible();
  await expect(
    page.getByText("Your inquiry has been saved", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".form-success")).toBeFocused();
});

test("mobile estimate errors keep entered details and focus accessible feedback", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/contact?service=Lawn%20Maintenance");
  await page.getByLabel("Full name").fill("Browser review");
  await page.getByLabel("Phone number").fill("(912) 555-0100");
  await page.getByLabel("Email address").fill("browser-test@example.com");
  await page.getByLabel("Property location").fill("Example property, Vidalia");
  await page
    .getByLabel("Tell us about your property")
    .fill("Reviewing the mobile form without saving a fictional inquiry.");
  await page.getByRole("checkbox").check();
  let serverError = false;
  await page.route("**/api/quotes", (route) =>
    route.fulfill({
      status: serverError ? 503 : 400,
      contentType: "application/json",
      body: JSON.stringify(
        serverError
          ? { error: "Please try again in a moment." }
          : {
              error: "Please check the highlighted fields.",
              fields: { phone: ["Please check this phone number."] },
            },
      ),
    }),
  );
  await page
    .locator("form")
    .getByRole("button", { name: "Request an Estimate" })
    .click();
  await expect(page.getByLabel("Phone number")).toBeFocused();
  await expect(page.getByLabel("Phone number")).toHaveAccessibleDescription(
    "Please check this phone number.",
  );
  serverError = true;
  await page
    .locator("form")
    .getByRole("button", { name: "Request an Estimate" })
    .click();
  await expect(page.locator("form").getByRole("alert")).toBeFocused();
  await expect(page.getByLabel("Full name")).toHaveValue("Browser review");
});
test("protected admin routes deny anonymous access", async ({
  page,
  request,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  for (const path of ["/api/admin/dashboard", "/api/admin/export"]) {
    const response = await request.get(path);
    expect(response.status()).toBe(401);
  }
  const response = await request.patch(
    "/api/admin/inquiries/00000000-0000-4000-8000-000000000000",
    {
      headers: { Origin: "http://localhost:3107" },
      data: { status: "closed" },
    },
  );
  expect(response.status()).toBe(401);
});
test("private dashboard sample controls, statuses, export, and logout", async ({
  page,
}) => {
  await signIn(page);
  await expect(
    page.getByText("Sample Data — Illustrative Dashboard Preview", {
      exact: true,
    }),
  ).toBeVisible();
  const count = await page.locator(".kpi-card").first().innerText();
  await page.getByRole("button", { name: "Last 7 days", exact: true }).click();
  await expect(page.locator(".kpi-card").first()).not.toHaveText(count);
  await page.getByRole("button", { name: "Last 90 days", exact: true }).click();
  await expect(
    page.getByText("Total pageviews", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Inquiries/ }).click();
  await page
    .getByRole("button", { name: "View inquiry from Alex Sample", exact: true })
    .first()
    .click();
  await expect(page.locator("dialog")).toBeVisible();
  await page
    .getByLabel("Inquiry status", { exact: true })
    .selectOption("contacted");
  await page.getByRole("button", { name: "Update sample status" }).click();
  await expect(page.getByRole("status")).toContainText("preview only");
  await page.getByRole("button", { name: "Close inquiry" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export sample CSV" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain("SAMPLE");
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  const realDataResponse = page.waitForResponse((response) =>
    response.url().includes("/api/admin/dashboard?mode=real&days=90"),
  );
  await page.getByRole("button", { name: "View real data" }).click();
  const realData = await (await realDataResponse).json();
  expect(realData.sample).toBe(false);
  await expect(
    page.getByText("Real Data — Website Analytics", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".kpi-card").first().locator("strong")).toHaveText(
    realData.metrics.pageviews.toLocaleString("en-US"),
  );
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});
test("dashboard is contained at all required sizes", async ({ page }) => {
  await signIn(page);
  for (const width of [1440, 768, 430, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const name of ["Overview", "Website traffic", "Inquiries"]) {
      await page
        .getByRole("button", { name: new RegExp("^" + name) })
        .first()
        .click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
});
test("accessibility audit: public pages, login, and dashboard", async ({
  page,
}) => {
  for (const path of [
    "/",
    "/services",
    "/our-work",
    "/about",
    "/contact",
    "/privacy",
    "/admin/login",
  ]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
      path,
    ).toEqual([]);
  }
  await signIn(page);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    results.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});
