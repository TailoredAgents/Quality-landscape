import test from "node:test";
import assert from "node:assert/strict";
import { resolveSiteUrl } from "../src/lib/site-url";

const render = {
  RENDER: "true",
  RENDER_EXTERNAL_URL: "https://quality-landscape.onrender.com",
};
test("Render cannot publish localhost canonical URLs from copied local settings", () => {
  assert.equal(
    resolveSiteUrl({
      ...render,
      SITE_URL: "http://127.0.0.1:3107",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3107",
    }),
    render.RENDER_EXTERNAL_URL,
  );
});
test("a final custom domain takes precedence over the Render subdomain", () => {
  assert.equal(
    resolveSiteUrl({
      ...render,
      NEXT_PUBLIC_SITE_URL: "https://landscape.example/old-path?tracking=1",
    }),
    "https://landscape.example",
  );
});
test("malformed and non-web origins fall back to the provider origin", () => {
  assert.equal(
    resolveSiteUrl({
      ...render,
      SITE_URL: "not-a-url",
      NEXT_PUBLIC_SITE_URL: "file:///tmp/site",
    }),
    render.RENDER_EXTERNAL_URL,
  );
});
test("local QA origins work and Render fails clearly if no public origin exists", () => {
  assert.equal(
    resolveSiteUrl({ SITE_URL: "http://localhost:3108" }),
    "http://localhost:3108",
  );
  assert.throws(
    () => resolveSiteUrl({ RENDER: "true", SITE_URL: "http://localhost:3107" }),
    /public SITE_URL/,
  );
});
