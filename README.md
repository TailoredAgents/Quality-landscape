# Quality Landscape & More

A complete Next.js website and private business dashboard for Quality Landscape & More. It has **not been deployed to Render**.

**Public presentation update:** Concept/mock-site messaging and placeholder sections have been removed from the public website. This local installation now uses `PREVIEW_MODE=false`, so estimate submissions save genuine inquiries to PostgreSQL. Email notifications remain unconfigured. Private sample analytics remain explicitly labeled and available through `ALLOW_SAMPLE_DATA=true`. Search indexing remains blocked until the separate business launch approval flag is enabled. This does not publish or deploy the site.

## Review this installation

- Public website: **http://localhost:3107**
- Private login: **http://localhost:3107/admin/login**
- Open **`.data/admin-access.txt` locally** for the generated administrator email and password. This ignored file is private; do not share it, add it to Git, or screen-share it during the meeting.
- Local PostgreSQL runs in Docker container `quality-landscape-postgres`, on loopback port `5547`, with volume `quality-landscape-pgdata`. Its private connection string is in `.env.local`.
- Port 3107 avoids the other local projects already using port 3000.

Start again from this folder:

```powershell
docker start quality-landscape-postgres
npm run dev
```

Keep that terminal running. Stop the Next.js process with Ctrl+C. Stopping or restarting the database container preserves its volume. Do not remove the volume unless you intend to erase this project's local records.

The final review uses the faster optimized presentation server on port 3107. To run that version again, stop any existing server using the port, then use `npm run build` followed by `npm start -- --port 3107`. Use `npm run dev` instead when you want edits to reload automatically.

## Presentation flow (10–15 minutes)

1. Open the home page at desktop width. Show the brand, photography, services, quality approach, gallery, and estimate actions.
2. Visit Services and use the service jump links and FAQ disclosures.
3. Open Our Work. Filter the gallery, open a photograph, use arrow keys or the previous/next buttons, then Escape to close.
4. Show About and the space reserved for the owner's approved story and portrait.
5. On Contact, show the working estimate form. Submitting it now creates a genuine database inquiry; avoid entering fictional customer details in the business database. Automated form testing uses an intercepted response and the separate QA database instead.
6. Open `/admin/login` and sign in using the private local credential file. The dashboard initially displays **Sample Data — Illustrative Dashboard Preview**.
7. Change the date range, inspect traffic, open an inquiry, demonstrate a sample status change, and export the sample CSV.
8. Select **View real data** to show the empty real dashboard and explain the separation. Switch back to sample mode for the presentation. Sign out when finished.

All displayed sample customer names, phone numbers, email addresses, traffic, and charts are fictional. Sample status changes live only in React state and reset on data reload. CSV downloads are labeled `SAMPLE`.

## Stack and structure

- Next.js App Router, TypeScript, React, Tailwind CSS 4, custom responsive CSS.
- Locally bundled Manrope and Fraunces variable fonts; no runtime Google Fonts request.
- Lucide icons, restrained Motion reveals with reduced-motion support, Recharts analytics.
- PostgreSQL through `pg` and parameterized SQL. No production JSON or browser database storage.
- bcryptjs password hashing, Node's cryptographic random tokens and HMAC primitives, server-side database sessions.
- Zod server validation, origin checks, bounded request bodies, honeypot protection, and database-backed rate limits.

| Location | Purpose |
| --- | --- |
| `src/app/(public)` | Five public pages plus privacy preferences |
| `src/components` | Shared visual components, accessible gallery, forms, dashboard |
| `src/lib/business.ts` | Central business details, proposed services, gallery manifest, owner approval flags |
| `src/lib/dashboard.ts` | Real PostgreSQL reporting queries |
| `src/lib/dashboard-data.ts` | Types, isolated sample generator, CSV escaping |
| `src/lib/auth.ts`, `security.ts` | Sessions, hashing, origin validation, limits |
| `src/app/api` | Inquiry, analytics, login, logout, and authorized admin endpoints |
| `migrations/001_initial.sql` | Idempotent transactional schema migration and indexes |
| `scripts` | Setup, migrations, retention, screenshots, production integration checks |
| `tests` | Validation and browser interaction/accessibility checks |
| `qa` | Review captures and QA reports; no credentials |
| `render.yaml` | One Render Node web service and one managed PostgreSQL database |

## New local installation

Requires Node.js 22 and npm. PostgreSQL is recommended for full verification; Docker is an easy local option.

```powershell
npm ci
npm run admin:setup
node scripts/local-postgres.mjs
npm run db:migrate
npm run dev
```

`local-postgres.mjs` creates only this project's named container and volume, uses the official `postgres:16` image, generates a random database password, and saves the connection privately. It fails rather than replacing an existing container. If the named container already exists, start it instead and retain its existing `.env.local` connection.

If Docker is unavailable, the setup command configures `DB_MODE=pglite` as a local-only fallback. PGlite runs PostgreSQL in-process and persists to `.data/postgres`; use one local application process. The fallback is refused when `NODE_ENV=production`. Production requires `DATABASE_URL`. Never use a local/ephemeral filesystem for permanent production leads.

### Administrator setup and rotation

`npm run admin:setup` generates a unique, random 32-character password, a cost-12 bcrypt hash, and a random session secret. It writes `.env.local` and `.data/admin-access.txt`, which are both ignored. It prints no credentials. There is no default password and no public registration.

To rotate local access:

```powershell
npm run admin:setup -- --rotate
```

Restart the app after rotation. A changed password hash, email, or session secret invalidates previously issued sessions. Sessions also expire after eight hours; logout removes the session from the database. To change the email, edit `ADMIN_EMAIL` privately and restart. For production, generate separate credentials in a private local copy and transfer only `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, and a separate `SESSION_SECRET` into Render's secret environment settings. Do not reuse the demonstration password.

**Next.js environment-file detail:** bcrypt hashes contain `$`. In `.env.local`, dollar signs must be escaped as `\$` so Next.js does not expand them. The setup script does this automatically. When entering a secret directly in Render's environment UI, enter the raw bcrypt hash without the backslashes. Do not put the plaintext password in an environment variable or repository file.

Login rate limits allow five failed account attempts per 15 minutes and 25 attempts per connection per 15 minutes. A successful sign-in clears the failed-account bucket. If presentation testing exhausts a limit, wait 15 minutes; production access must not bypass it.

## Environment variables

See `.env.example`. The local real secrets are intentionally absent from this guide.

| Variable | Purpose |
| --- | --- |
| `PREVIEW_MODE` | Defaults to `true`. Only the exact string `false` enables live inquiry/traffic storage. Rebuild public pages when changing it. |
| `NEXT_PUBLIC_SITE_URL` | Full canonical origin, including protocol and local port if applicable. Set before build. |
| `SITE_URL` | Optional server origin override for integration tests; normally leave unset or match the public origin exactly. |
| `DATABASE_URL` | PostgreSQL connection string; required in every deployed environment. |
| `DATABASE_SSL` | Set `true` for a database requiring verified TLS. Render's internal connection does not require this flag. Certificate verification is never disabled. |
| `ADMIN_EMAIL` | One internal administrator email. |
| `ADMIN_PASSWORD_HASH` | bcrypt hash, cost 12–16. |
| `SESSION_SECRET` | Random secret with at least 32 characters; use a fresh production secret. |
| `TRUST_PROXY` | Enable only behind a trusted hosting proxy, such as the Render deployment. Uses a hashed connection identifier for rate limits, never a stored raw IP. |
| `DB_MODE` | `pglite` enables the local development fallback only. Omit on Render. |
| `LOCAL_DATABASE_PATH` | Local fallback location; defaults to `.data/postgres`. |
| `ALLOW_SAMPLE_DATA` | Defaults to false in live mode. Optional explicit access to isolated sample data for an authenticated administrator. Preview always permits samples. |
| `RESEND_API_KEY` | Optional Resend API credential. |
| `EMAIL_FROM` | Verified sender address for the optional provider. |
| `LEAD_NOTIFICATION_EMAIL` | Business recipient, to be confirmed by the owner. |
| `ANALYTICS_RETENTION_DAYS` | Default 90; used by the retention command. |
| `INQUIRY_RETENTION_DAYS` | Default 365; used by the retention command. |

## Preview versus live behavior

**Internal preview setting:** public navigation and gallery behavior work without concept-site banners. With `PREVIEW_MODE=true`, estimate requests create no inquiry, conversion, or email, and the form reports that online requests are unavailable rather than displaying a false success. The analytics endpoint returns without writing events. The dashboard still requires real secure authentication. Sample data is generated in memory and cannot contaminate real tables. Indexing remains blocked. This local installation currently uses live storage behavior with `PREVIEW_MODE=false`.

**Live:** valid estimate submissions are stored in PostgreSQL and become visible to the authenticated administrator. Optional notifications run only when all three email settings exist. A missing provider is recorded as `not_configured`; a provider failure is recorded as `failed`. `sent` means the provider accepted the message; mailbox delivery must be verified before launch. A successfully saved inquiry remains a successful submission even if notification delivery fails. Confirmed conversions are counted without customer information or a link to the inquiry.

There is no fake booking or pricing engine. Estimate submission does not confirm a booking, service area, price, or schedule.

## Analytics and privacy

- Public traffic collection begins only after analytics consent. Declining leaves all website features available.
- Browser Do Not Track and Global Privacy Control suppress collection on both client and server. Admin pages are excluded by the public layout and endpoint path allowlist.
- Random browser IDs expire after 90 days. Sessions roll over after 30 minutes of inactivity. Browser IDs and session IDs are HMAC-hashed before PostgreSQL storage.
- Traffic stores only allowed public page paths, referral hostnames, restricted UTM labels, broad screen categories, timestamps, and bounded engagement durations. No raw IP, contact data, full referrer URL, or query string is stored in traffic rows. Never put personal information in campaign labels.
- Inquiry contact details are stored separately. No browser identifier is attached to an inquiry.
- Pageviews count consenting browser activity. Visitors and visits are estimates, not identified people. Sources and devices represent shares of pageviews, explicitly labeled in the interface.
- Inquiry conversion is all saved inquiries divided by consenting visitor estimates, so it can exceed 100%. With no visitors, the UI displays a dash. It is not a guaranteed or person-level conversion rate.
- Engagement is the first visibility change or navigation away from a page, capped at 30 minutes. It is an approximate engaged-page measure, not exact attention tracking.
- Dates and report ranges use America/New_York. The real 7/30/90-day controls query persisted data. The inquiry list caps at 500 latest records; CSV exports all records in the selected range.
- Analytics failures are swallowed and never block public navigation or estimate storage. Browser storage failures are handled safely.

Apply configurable retention:

```powershell
npm run db:prune
```

This removes expired analytics and inquiries according to the configured day limits, plus expired security sessions and rate-limit buckets. Schedule it daily using a Render Cron Job or another scheduler with the same private `DATABASE_URL`. **A scheduler has not been provisioned.** Until configured, retention is an available maintenance command, not an automatically enforced deadline. Align the published privacy notice with the final retention settings and owner's policy. Use the database backup process to support recovery and authorized information requests.

## Render deployment

Prepared using the official [Next.js deployment guidance](https://render.com/docs/deploy-nextjs-app) and [Blueprint specification](https://render.com/docs/blueprint-spec). No hosting resources have been purchased or deployed.

1. Put the source in a private repository. Exclude `.env.local`, `.data`, `node_modules`, and build/test output. Verify ignored paths before the first push.
2. Create a Render Blueprint from `render.yaml`. It defines a paid `starter` Node service and a `0.1c-256mb` managed PostgreSQL 16 instance; review current resource pricing in Render before provisioning. Keep both resources in the same region.
3. Enter private admin email/hash and the exact HTTPS site origin when prompted. Render generates a fresh session secret. The database uses its private internal connection. Public database access is disabled by the empty IP allowlist.
4. The build runs `npm ci && npm run build`; pre-deploy runs `npm run db:migrate`; startup runs `npm start`, using Render's `PORT`. `/api/health` is a lightweight application-process health check, not a database-readiness check.
5. Leave `PREVIEW_MODE=true` for the owner presentation. Do not put secrets in source or public `NEXT_PUBLIC_` variables.
6. Verify HTTPS, correct origin checks, admin sign-in and logout, database connectivity, and the real empty dashboard on the hosted preview.
7. Configure automatic database backups and monitoring appropriate to the chosen plan. Add the daily retention command. Scale the small database if real load requires it.

### Before enabling live mode

Obtain and enter the following owner-approved information:

- Confirm `(912) 585-3450` and an appropriate lead-notification email.
- Confirm exact services, especially the scope of irrigation work; confirm service areas, availability, and any published hours. Do not add unverified installation, construction, or advanced services.
- Supply genuine project photographs and permission to use them; replace the gallery, hero, service, and closing photography as appropriate. `src/lib/business.ts` centralizes the gallery and service image manifests; shared hero/CTA images live in page/component props. Optional `beforeSrc` supports genuine before/after pairs in the lightbox.
- Supply owner identity, real story, and approved portrait; verify claims in final copy. Add testimonials only with verified content and permission.
- Approve the brand wordmark, final copy, privacy notice, retention policy, contact handling, and final domain.
- Set a separate production admin account and secret; connect the persistent database and apply migrations.
- Configure a verified Resend sender, API key, and recipient. Test a real delivery, provider error behavior, and the dashboard's notification status. **Live email delivery has not been tested because credentials were not supplied.**
- Set `phoneVerified`, `servicesVerified`, and `approvedForLaunch` in the centralized business configuration only after confirmation. Replace preview-specific explanatory copy with approved final content.
- Set `PREVIEW_MODE=false` and rebuild/redeploy. Indexing remains blocked until `approvedForLaunch=true` as well. Confirm sitemap, canonical URLs, metadata, local-business structured data, and robots behavior on the final domain. No fabricated ratings, reviews, hours, or address are emitted.

The preview is intentionally distinguishable from the official business site. Final content review and the real email delivery test remain necessary before launch.

## Checks and evidence

```powershell
npm run typecheck
npm run lint
npm test
npm run build
# With the preview running on port 3107:
npm run test:browser
# With a completed production build and local PostgreSQL:
node node_modules/tsx/dist/cli.mjs scripts/test-backend.ts
# Includes an isolated live build and browser consent/privacy checks:
node scripts/test-live-browser.mjs
```

Browser tests use Chromium, Playwright, and axe-core. Install Chromium if needed with `node node_modules/playwright/cli.js install chromium`. Traces are disabled to avoid recording login credentials. Tests read the private local credential file and never print its contents.

The backend integration command creates an isolated `quality_qa_<random>` database on the local PostgreSQL instance, runs a production Next.js server on port 3108, and verifies real writes, aggregation, authorization, cookie flags, logout, expiration, credential invalidation, status changes, CSV formula protection, rate limits, and persistence through process restart. It does not touch the presentation database's inquiry/analytics tables or send email. The isolated QA database is retained for inspection; its name is recorded in `qa/backend-results.json`.

The live-browser helper also prepares a separate source/build copy under ignored `.data`, so it can verify consent, decline, DNT, GPC, and storage-disabled inquiry behavior with `PREVIEW_MODE=false` without changing the presentation build. Optional email success/failure handling is tested with mocked provider responses; no real delivery is implied.

Visual evidence is in `qa/screenshots` (local ignored captures); the final `qa/TESTING.md` describes what was inspected and what remains unverified. Screenshot helpers cover 375, 430, 768, and 1440 pixels and all five public pages, plus login and dashboard views.

The npm production dependency audit reported no vulnerabilities at build time. The full audit reported five high-severity development-tool findings from a single unpatched `braces` dependency chain used by the Next ESLint plugin. These packages are not public request handlers. Track the upstream fix and rerun `npm audit` before production; do not apply an incompatible framework downgrade through `npm audit fix --force`.

## Photography and licenses

All preview photography is illustrative and stored locally. It is not represented as company work. See [ASSET-LICENSES.md](ASSET-LICENSES.md) for source pages, photographers, and license links. The landscape line mark and wordmark are original SVG/type compositions; no generic tree clip art or invented business review is used.

## Operations and future work

One web application is sufficient. Add integrations only after the owner approves the site and the business need is clear. No chat assistant, phone receptionist, ongoing SEO agent, scheduling automation, or external CRM has been implemented.

For production, keep dependencies patched, monitor errors and failed email notifications, review database backups and retention runs, and rotate administrator access through the private procedure. Customer information should only be exported or shared by the authorized administrator.
