import { test } from "node:test";
import assert from "node:assert/strict";
import {
  quoteSchema,
  referralSource,
  safeCampaign,
  analyticsSchema,
} from "../src/lib/validation";
import { sampleDashboard, csvEscape } from "../src/lib/dashboard-data";
const valid = {
  name: "Test Customer",
  phone: "(912) 555-0100",
  email: "test@example.com",
  service: "Lawn Maintenance",
  location: "Example property",
  message: "Please discuss lawn care.",
  consent: "yes",
  website: "",
};
test("inquiry validation rejects bad contact, service, consent, oversized input, and spam", () => {
  assert.ok(quoteSchema.safeParse(valid).success);
  for (const change of [
    { email: "invalid" },
    { phone: "abcdefg" },
    { service: "Outdoor kitchen" },
    { consent: "no" },
    { website: "spam.example" },
    { message: "x".repeat(3001) },
  ])
    assert.equal(quoteSchema.safeParse({ ...valid, ...change }).success, false);
});
test("referral storage strips paths, query strings, credentials, and internal visits", () => {
  assert.equal(
    referralSource(
      "https://user:pass@www.google.com/search?q=private",
      "https://example.com",
    ),
    "google.com",
  );
  assert.equal(
    referralSource("https://example.com/private", "https://example.com"),
    "Direct",
  );
  assert.equal(
    referralSource("javascript:alert(1)", "https://example.com"),
    "Direct",
  );
});
test("campaign labels drop common contact information", () => {
  assert.equal(safeCampaign("summer-lawn"), "summer-lawn");
  assert.equal(safeCampaign("user@example.com"), "");
  assert.equal(safeCampaign("9125550100"), "");
});
test("admin and arbitrary URL paths cannot become public traffic records", () => {
  for (const path of [
    "/admin",
    "/contact?email=private",
    "https://third-party.test",
  ])
    assert.equal(
      analyticsSchema.safeParse({
        consent: "accepted",
        kind: "pageview",
        path,
        visitor: crypto.randomUUID(),
        session: crypto.randomUUID(),
        device: "desktop",
      }).success,
      false,
    );
});
test("CSV prevents formula injection and escapes delimiters", () => {
  assert.equal(csvEscape("=CMD()"), '"\'=CMD()"');
  assert.equal(csvEscape('a,"b"'), '"a,""b"""');
  assert.equal(csvEscape("+19125550100"), '"\'+19125550100"');
});
test("sample date ranges produce separated, clearly fictional data", () => {
  for (const days of [7, 30, 90]) {
    const data = sampleDashboard(days);
    assert.equal(data.sample, true);
    assert.equal(data.daily.length, days);
    assert.ok(
      data.inquiries.every(
        (i) => i.id.startsWith("sample-") && i.email.endsWith("@example.com"),
      ),
    );
    assert.equal(
      data.metrics.pageviews,
      data.daily.reduce((n, d) => n + d.pageviews, 0),
    );
  }
});
