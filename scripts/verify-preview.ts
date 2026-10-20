import nextEnv from "@next/env";
import { Pool } from "pg";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
nextEnv.loadEnvConfig(process.cwd());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const counts = async () =>
  (
    await pool.query(
      "SELECT (SELECT count(*)::int FROM inquiries) inquiries,(SELECT count(*)::int FROM analytics_events) events",
    )
  ).rows[0];
const before = await counts();
const base = "http://localhost:3107";
const quote = await fetch(base + "/api/quotes", {
  method: "POST",
  headers: { Origin: base, "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Preview Test",
    phone: "9125550100",
    email: "preview@example.com",
    service: "Lawn Maintenance",
    location: "Fictional property",
    message: "Safe demonstration to verify preview isolation.",
    consent: "yes",
    website: "",
  }),
});
assert.equal(quote.status, 200);
const result = await quote.json();
assert.equal(result.preview, true);
assert.equal(result.stored, false);
assert.equal(result.emailSent, false);
const event = await fetch(base + "/api/analytics", {
  method: "POST",
  headers: { Origin: base, "Content-Type": "application/json" },
  body: JSON.stringify({
    kind: "pageview",
    consent: "accepted",
    path: "/",
    visitor: crypto.randomUUID(),
    session: crypto.randomUUID(),
    device: "desktop",
  }),
});
assert.equal(event.status, 204);
assert.deepEqual(await counts(), before);
assert.equal(before.inquiries, 0);
assert.equal(before.events, 0);
const robots = await fetch(base + "/robots.txt");
assert.ok((await robots.text()).includes("Disallow: /"));
const home = await fetch(base);
assert.ok(home.headers.get("x-robots-tag")?.includes("noindex"));
assert.ok((await home.text()).includes("noindex"));
await writeFile(
  "qa/preview-results.json",
  JSON.stringify(
    {
      passed: true,
      previewSubmissionsStored: false,
      previewEmailSent: false,
      realInquiryCount: before.inquiries,
      realEventCount: before.events,
      indexingBlocked: true,
    },
    null,
    2,
  ),
);
await pool.end();
console.log(
  "PASS: Preview form and analytics wrote no records, sent no email, and retained an empty real dashboard. Indexing is blocked.",
);
