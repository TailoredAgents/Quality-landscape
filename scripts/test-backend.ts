import nextEnv from "@next/env";
import { Pool } from "pg";
import { spawn, spawnSync } from "node:child_process";
import { randomUUID, randomBytes, createHmac } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { closeDatabase } from "../src/lib/db";
import { chromium, expect } from "@playwright/test";
nextEnv.loadEnvConfig(process.cwd());
const base = "http://localhost:3108";
if (!process.env.DATABASE_URL)
  throw new Error("Local PostgreSQL is required for this integration test.");
const adminPool = new Pool({ connectionString: process.env.DATABASE_URL });
const dbName = `quality_qa_${randomBytes(5).toString("hex")}`;
await adminPool.query(`CREATE DATABASE ${dbName}`);
const url = new URL(process.env.DATABASE_URL);
url.pathname = "/" + dbName;
const pool = new Pool({ connectionString: url.toString() });
await pool.query(await readFile("migrations/001_initial.sql", "utf8"));
const access = await readFile(".data/admin-access.txt", "utf8");
const email = access.match(/Email: (.+)/)![1];
const password = access.match(/Password: (.+)/)![1];
const report: string[] = [];
let server: ReturnType<typeof spawn> | undefined;
async function start() {
  server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--port",
      "3108",
      "--hostname",
      "127.0.0.1",
    ],
    {
      env: {
        ...process.env,
        DATABASE_URL: url.toString(),
        PREVIEW_MODE: "false",
        SITE_URL: base,
        ALLOW_SAMPLE_DATA: "false",
        RESEND_API_KEY: "",
        EMAIL_FROM: "",
        LEAD_NOTIFICATION_EMAIL: "",
      },
      cwd: process.env.QA_APP_DIR || process.cwd(),
      stdio: "ignore",
    },
  );
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(base + "/api/health")).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Integration server did not start.");
}
async function stop() {
  if (!server) return;
  const process = server;
  server = undefined;
  const done = new Promise<void>((r) => process.once("exit", () => r()));
  process.kill();
  await done;
}
async function call(
  path: string,
  method = "GET",
  data?: unknown,
  cookie?: string,
  origin: string | null = base,
  extra: Record<string, string> = {},
) {
  return fetch(base + path, {
    method,
    headers: {
      ...(data !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(origin ? { Origin: origin } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...extra,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
    redirect: "manual",
  });
}
async function login() {
  const response = await call("/api/auth/login", "POST", { email, password });
  assert.equal(response.status, 200, "Valid credentials sign in");
  const cookie = response.headers.get("set-cookie")!;
  assert.ok(
    cookie.includes("HttpOnly") &&
      cookie.includes("Secure") &&
      /SameSite=strict/i.test(cookie),
    "Production session cookie flags",
  );
  return cookie.split(";")[0];
}
const lead = {
  name: "=QA Example",
  phone: "(912) 555-0100",
  email: "qa@example.com",
  service: "Lawn Maintenance",
  location: "Fictional test property",
  message: "=Illustrative QA inquiry, only in an isolated test database.",
  consent: "yes",
  website: "",
};
try {
  await start();
  for (const path of ["/api/admin/dashboard", "/api/admin/export"])
    assert.equal((await call(path)).status, 401);
  assert.equal(
    (
      await call(
        "/api/auth/login",
        "POST",
        { email, password },
        undefined,
        "https://untrusted.example",
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await call(
        "/api/auth/login",
        "POST",
        { email, password },
        undefined,
        null,
      )
    ).status,
    403,
  );
  assert.equal(
    (await call("/api/quotes", "POST", { ...lead, message: "x".repeat(20000) }))
      .status,
    413,
  );
  const invalidJson = await fetch(base + "/api/quotes", {
    method: "POST",
    headers: { Origin: base, "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(invalidJson.status, 400);
  assert.equal(
    (
      await call("/api/auth/login", "POST", {
        email,
        password: "incorrect-password",
      })
    ).status,
    401,
  );
  let cookie = await login();
  const session = await pool.query(
    "SELECT token_hash,expires_at FROM admin_sessions",
  );
  assert.equal(session.rows.length, 1);
  assert.ok(!session.rows[0].token_hash.includes(cookie.split("=")[1]));
  assert.equal(
    (await call("/api/admin/dashboard?mode=sample", "GET", undefined, cookie))
      .status,
    403,
  );
  report.push(
    "Origin / CSRF protection, request-size limits, malformed JSON, secure cookies, hashed sessions, protected APIs, and disabled production sample mode passed.",
  );
  for (const change of [
    { phone: "invalid" },
    { email: "invalid" },
    { website: "spam.example" },
    { consent: "no" },
  ])
    assert.equal(
      (await call("/api/quotes", "POST", { ...lead, ...change })).status,
      400,
    );
  const submission = await call("/api/quotes", "POST", lead);
  assert.equal(submission.status, 200);
  const submissionResult = await submission.json();
  assert.equal(submissionResult.stored, true);
  assert.equal(submissionResult.emailSent, false);
  assert.equal(submissionResult.preview, false);
  const stored = await pool.query("SELECT * FROM inquiries");
  assert.equal(stored.rows.length, 1);
  assert.equal(stored.rows[0].email, "qa@example.com");
  assert.equal(stored.rows[0].notification_status, "not_configured");
  report.push(
    "Production quote validation, honeypot, PostgreSQL storage, and honest unconfigured-email response passed.",
  );
  const event = {
    kind: "pageview",
    consent: "accepted",
    path: "/",
    visitor: randomUUID(),
    session: randomUUID(),
    referrer: "https://www.google.com/search?q=private",
    utmSource: "google",
    utmMedium: "organic",
    utmCampaign: "user@example.com",
    device: "mobile",
  };
  assert.equal(
    (await call("/api/analytics", "POST", { ...event, consent: undefined }))
      .status,
    400,
  );
  assert.equal(
    (await call("/api/analytics", "POST", { ...event, path: "/admin" })).status,
    400,
  );
  const beforeCount = (
    await pool.query("SELECT count(*)::int n FROM analytics_events")
  ).rows[0].n;
  assert.equal(
    (await call("/api/analytics", "POST", event, undefined, base, { DNT: "1" }))
      .status,
    204,
  );
  assert.equal(
    (
      await call("/api/analytics", "POST", event, undefined, base, {
        "Sec-GPC": "1",
      })
    ).status,
    204,
  );
  assert.equal(
    (await pool.query("SELECT count(*)::int n FROM analytics_events")).rows[0]
      .n,
    beforeCount,
  );
  assert.equal((await call("/api/analytics", "POST", event)).status, 204);
  await call("/api/analytics", "POST", { ...event, path: "/services" });
  await call("/api/analytics", "POST", {
    ...event,
    kind: "engagement",
    duration: 18,
  });
  const events = (
    await pool.query("SELECT * FROM analytics_events WHERE kind='pageview'")
  ).rows;
  assert.equal(events.length, 2);
  assert.equal(events[0].source, "google.com");
  assert.equal(events[0].utm_campaign, "");
  assert.ok(events[0].visitor_hash !== event.visitor);
  assert.ok(!JSON.stringify(events).includes("qa@example.com"));
  assert.ok(!JSON.stringify(events).includes("q=private"));
  for (const days of [7, 30, 90]) {
    const r = await call(
      `/api/admin/dashboard?days=${days}`,
      "GET",
      undefined,
      cookie,
    );
    assert.equal(r.status, 200);
    const data = await r.json();
    assert.equal(data.daily.length, days);
    assert.equal(data.metrics.pageviews, 2);
    assert.equal(data.metrics.visitors, 1);
    assert.equal(data.metrics.sessions, 1);
    assert.equal(data.metrics.quotes, 1);
    assert.equal(data.metrics.engagement, 18);
    assert.equal(
      data.daily.reduce(
        (n: number, d: { pageviews: number }) => n + d.pageviews,
        0,
      ),
      2,
    );
  }
  report.push(
    "Consented analytics, DNT/GPC suppression, admin-path exclusion, referral sanitization, pseudonymous identifiers, engagement, and accurate 7/30/90-day PostgreSQL aggregation passed.",
  );
  const id = stored.rows[0].id;
  assert.equal(
    (
      await call(
        `/api/admin/inquiries/${id}`,
        "PATCH",
        { status: "contacted" },
        cookie,
        "https://untrusted.example",
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await call(
        `/api/admin/inquiries/${id}`,
        "PATCH",
        { status: "invalid" },
        cookie,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        `/api/admin/inquiries/${id}`,
        "PATCH",
        { status: "contacted" },
        cookie,
      )
    ).status,
    200,
  );
  assert.equal(
    (await pool.query("SELECT status FROM inquiries WHERE id=$1", [id])).rows[0]
      .status,
    "contacted",
  );
  const exported = await call(
    "/api/admin/export?days=30",
    "GET",
    undefined,
    cookie,
  );
  assert.equal(exported.status, 200);
  assert.ok((await exported.text()).includes("'=QA Example"));
  report.push(
    "Authorized inquiry status changes and CSV export with formula-injection protection passed.",
  );
  assert.equal(
    (await call("/api/auth/logout", "POST", undefined, cookie)).status,
    200,
  );
  assert.equal(
    (await call("/api/admin/dashboard", "GET", undefined, cookie)).status,
    401,
  );
  cookie = await login();
  const hash = createHmac("sha256", process.env.SESSION_SECRET!)
    .update(cookie.split("=")[1])
    .digest("hex");
  await pool.query(
    "UPDATE admin_sessions SET expires_at=now()-interval '1 minute' WHERE token_hash=$1",
    [hash],
  );
  assert.equal(
    (await call("/api/admin/dashboard", "GET", undefined, cookie)).status,
    401,
  );
  cookie = await login();
  await pool.query("UPDATE admin_sessions SET credential_version='rotated'");
  assert.equal(
    (await call("/api/admin/dashboard", "GET", undefined, cookie)).status,
    401,
  );
  report.push(
    "Logout replay rejection, server-side expiration, and credential-version invalidation passed.",
  );
  await stop();
  await start();
  cookie = await login();
  const persisted = await (
    await call("/api/admin/dashboard", "GET", undefined, cookie)
  ).json();
  assert.equal(persisted.metrics.quotes, 1);
  assert.equal(persisted.inquiries[0].status, "contacted");
  assert.equal(persisted.metrics.pageviews, 2);
  report.push(
    "Application restart preserved inquiry, status, and analytics records in PostgreSQL.",
  );
  if (process.env.QA_LIVE_BROWSER === "true") {
    const browser = await chromium.launch();
    const pageviewCount = async () =>
      (
        await pool.query(
          "SELECT count(*)::int n FROM analytics_events WHERE kind='pageview'",
        )
      ).rows[0].n;
    const baseline = await pageviewCount();
    const errors: string[] = [];
    try {
      const context = await browser.newContext({
        viewport: { width: 375, height: 900 },
      });
      const page = await context.newPage();
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(base, { waitUntil: "networkidle" });
      await expect(
        page.getByRole("button", { name: "Decline", exact: true }),
      ).toBeVisible();
      assert.equal(await pageviewCount(), baseline);
      await page.getByRole("button", { name: "Decline", exact: true }).click();
      await page.goto(base + "/services", { waitUntil: "networkidle" });
      assert.equal(await pageviewCount(), baseline);
      await page.goto(base + "/privacy");
      await page
        .getByRole("button", { name: "Allow analytics", exact: true })
        .click();
      await expect.poll(pageviewCount).toBe(baseline + 1);
      await page.goto(base + "/services", { waitUntil: "networkidle" });
      await expect.poll(pageviewCount).toBe(baseline + 2);
      await context.close();
      for (const privacy of ["dnt", "gpc"]) {
        const protectedContext = await browser.newContext({
          extraHTTPHeaders:
            privacy === "dnt" ? { DNT: "1" } : { "Sec-GPC": "1" },
        });
        await protectedContext.addInitScript(
          (p) =>
            Object.defineProperty(
              navigator,
              p === "dnt" ? "doNotTrack" : "globalPrivacyControl",
              { value: p === "dnt" ? "1" : true, configurable: true },
            ),
          privacy,
        );
        const protectedPage = await protectedContext.newPage();
        protectedPage.on("pageerror", (e) => errors.push(e.message));
        const before = await pageviewCount();
        await protectedPage.goto(base + "/privacy");
        await protectedPage
          .getByRole("button", { name: "Allow analytics", exact: true })
          .click();
        await protectedPage.goto(base + "/services", {
          waitUntil: "networkidle",
        });
        assert.equal(await pageviewCount(), before);
        await protectedContext.close();
      }
      const restricted = await browser.newContext();
      await restricted.addInitScript(() =>
        Object.defineProperty(window, "localStorage", {
          get() {
            throw new DOMException("Storage disabled", "SecurityError");
          },
        }),
      );
      const restrictedPage = await restricted.newPage();
      restrictedPage.on("pageerror", (e) => errors.push(e.message));
      await restrictedPage.goto(base + "/contact");
      await restrictedPage
        .getByLabel("Full name")
        .fill("Restricted Storage QA");
      await restrictedPage.getByLabel("Phone number").fill("9125550100");
      await restrictedPage
        .getByLabel("Email address")
        .fill("restricted@example.com");
      await restrictedPage
        .getByLabel("Service requested")
        .selectOption("Lawn Maintenance");
      await restrictedPage
        .getByLabel("Property location")
        .fill("Fictional QA property");
      await restrictedPage
        .getByLabel("Tell us about your property")
        .fill("This is a safe QA submission in the isolated test database.");
      await restrictedPage.getByRole("checkbox").check();
      await restrictedPage
        .locator("form")
        .getByRole("button", { name: "Request an Estimate" })
        .click();
      await expect(
        restrictedPage.getByRole("heading", {
          name: "Your request is received.",
        }),
      ).toBeVisible();
      assert.deepEqual(errors, []);
      await restricted.close();
      report.push(
        "Live-mode browser checks passed: no traffic before consent or after decline, real pageviews after opt-in, DNT/GPC honored, and a real inquiry still saved with browser storage blocked.",
      );
    } finally {
      await browser.close();
    }
  }
  for (let i = 0; i < 5; i++)
    assert.equal(
      (
        await call("/api/auth/login", "POST", {
          email,
          password: "incorrect-password",
        })
      ).status,
      401,
    );
  assert.equal(
    (
      await call("/api/auth/login", "POST", {
        email,
        password: "incorrect-password",
      })
    ).status,
    429,
  );
  process.env.DATABASE_URL = url.toString();
  const { rateLimit } = await import("../src/lib/security");
  await Promise.all([
    rateLimit("qa-concurrent", 3, 60),
    rateLimit("qa-concurrent", 3, 60),
    rateLimit("qa-concurrent", 3, 60),
  ]);
  await assert.rejects(() => rateLimit("qa-concurrent", 3, 60));
  report.push(
    "Login brute-force rate limiting and atomic database rate limits passed.",
  );
  const originalFetch = globalThis.fetch;
  process.env.RESEND_API_KEY = "qa-mocked-provider-key";
  process.env.EMAIL_FROM = "Website <website@example.com>";
  process.env.LEAD_NOTIFICATION_EMAIL = "owner@example.com";
  const { notifyLead } = await import("../src/lib/mail");
  try {
    globalThis.fetch = async (input, init) => {
      assert.equal(String(input), "https://api.resend.com/emails");
      const body = JSON.parse(String(init?.body));
      assert.deepEqual(body.to, ["owner@example.com"]);
      assert.ok(
        new Headers(init?.headers)
          .get("Idempotency-Key")
          ?.startsWith("inquiry-"),
      );
      return Response.json({ id: "mock-delivery" });
    };
    assert.equal(
      await notifyLead({ id, name: "QA Sample", service: "Lawn Maintenance" }),
      "sent",
    );
    globalThis.fetch = async () =>
      new Response("Provider error", { status: 500 });
    assert.equal(
      await notifyLead({ id, name: "QA Sample", service: "Lawn Maintenance" }),
      "failed",
    );
    globalThis.fetch = async () => {
      throw new Error("Simulated network failure");
    };
    assert.equal(
      await notifyLead({ id, name: "QA Sample", service: "Lawn Maintenance" }),
      "failed",
    );
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
    delete process.env.LEAD_NOTIFICATION_EMAIL;
  }
  report.push(
    "Optional email request format, idempotency, success, provider error, and network failure passed with mocked responses. No real email was sent; live delivery still requires credentials.",
  );
  await pool.query(
    "INSERT INTO analytics_events(kind,path,device,created_at) VALUES('pageview','/','unknown',now()-interval '100 days')",
  );
  await pool.query(
    "INSERT INTO inquiries(id,name,phone,email,service,location,message,created_at) VALUES($1,'Expired QA','9125550100','expired@example.com','Lawn Maintenance','Example','Expired test record',now()-interval '366 days')",
    [randomUUID()],
  );
  const pruning = spawnSync(
    process.execPath,
    ["node_modules/tsx/dist/cli.mjs", "scripts/prune.ts"],
    {
      env: {
        ...process.env,
        DATABASE_URL: url.toString(),
        ANALYTICS_RETENTION_DAYS: "90",
        INQUIRY_RETENTION_DAYS: "365",
      },
      stdio: "pipe",
    },
  );
  assert.equal(pruning.status, 0, "Retention command succeeded");
  assert.equal(
    (
      await pool.query(
        "SELECT count(*)::int n FROM analytics_events WHERE created_at<now()-interval '90 days'",
      )
    ).rows[0].n,
    0,
  );
  assert.equal(
    (
      await pool.query(
        "SELECT count(*)::int n FROM inquiries WHERE created_at<now()-interval '365 days'",
      )
    ).rows[0].n,
    0,
  );
  report.push(
    "Configured analytics, inquiry, and expired-security-record retention command passed in the isolated QA database.",
  );
  await writeFile(
    "qa/backend-results.json",
    JSON.stringify({ passed: true, database: dbName, checks: report }, null, 2),
  );
  for (const line of report) console.log("PASS:", line);
} finally {
  await stop();
  await closeDatabase();
  await pool.end();
  await adminPool.end();
}
