# Completion and QA report

Date: October 20, 2026 · America/New_York

## Public-copy update

At the user's request, public concept/mock-site language, the top banner, pending-owner notices, and placeholder biography/testimonial copy were removed. Stock imagery is framed as landscape inspiration with a neutral photography credit, rather than company project history. The local environment now uses real PostgreSQL inquiry storage (`PREVIEW_MODE=false`), with email notifications still unconfigured and search indexing still blocked by the launch-approval flag. Private sample analytics remain labeled and separate. Browser form tests intercept the success response to avoid inserting fictional customers in the business database; the backend integration suite tests actual writes in an isolated QA database.

## Delivered

- Five complete responsive public pages: Home, Services, Our Work, About, Contact. Supporting privacy/preferences and a custom 404 are included.
- Locally bundled typography, original wordmark/favicon, licensed illustrative photography, responsive optimized image delivery, accessible navigation, filterable gallery, full-screen keyboard lightbox, FAQ disclosures, and validated estimate form.
- Authenticated private dashboard with sample and real modes, 7/30/90-day reporting, pageviews, visitor/session estimates, conversions, engagement, sources, landing pages, device categories, UTM campaigns, inquiry details/status management, and CSV export.
- PostgreSQL persistence and indexed transactional migration. Secure bcrypt login, expiring hashed database sessions, credential rotation invalidation, logout, protected APIs, origin checks, bounded bodies, honeypot, rate limits, and secure production cookie flags.
- Preview-safe submissions and traffic handling; real first-party consent-based analytics; optional Resend notifications; retention command; Render blueprint; environment example; full setup, presentation, deployment, and owner-approval guide.

## Visual review and actual improvements

The application was opened in the in-app browser and inspected through locally rendered Chromium screenshots. All five public pages and the login/dashboard were captured at 375, 430, 768, and 1440 pixel widths. Desktop and phone full-page captures and tablet compositions were visually reviewed, including photography, headline breaks, forms, footer layout, and dashboard tables.

Changes made after viewing the rendered output:

- Moved to port 3107 when the first check revealed another project already answering on port 3000.
- Increased supporting copy, form input/label sizes, dashboard text, and mobile form sizes.
- Darkened low-contrast sage text, status labels, and supporting text while retaining the palette.
- Fixed a hidden accessibility label that caused whole-page dashboard overflow.
- Added a swipe cue and keyboard-focusable scroll region for mobile inquiry tables.
- Removed development indicators from the preview.
- Refined the small-phone contact heading and service headline wrapping.
- Switched the final presentation review to the optimized production build to eliminate development reloads from screenshots.

The photographic assets were also inspected in a contact sheet before use. Photos remain explicitly illustrative and easily replaceable; no invented completed projects, reviews, staff, biography, customer counts, or achievements were introduced.

## Automated checks

- TypeScript check: passed.
- ESLint: passed.
- Production Next.js build: passed.
- Six validation/CSV/sample-data tests: passed.
- Eight Playwright browser tests: passed. These cover every public route at all four sizes, image loading, overflow, mobile menu navigation/Escape, gallery filters and keyboard navigation/focus restoration, form validation and safe preview success, anonymous access blocking, dashboard date/mode controls, status demonstrations, export, and logout.
- axe-core WCAG A/AA automated checks: passed on all public pages, privacy, login, and the dashboard overview. Automated tools do not replace a complete manual accessibility audit.
- Final public screenshot collection: no broken images or viewport overflow across all five pages and all four widths.
- Final dashboard capture collection: no viewport overflow or browser runtime errors at all four widths. Tables scroll within their own region.
- Production dependency audit: no reported vulnerabilities. The complete audit has five high-severity development-tool findings in the Next ESLint plugin's unpatched `braces` chain. See README; no incompatible force downgrade was applied.

## PostgreSQL and production-mode verification

The production backend was exercised against a newly created, isolated QA database, separate from the presentation database. Results are in `backend-results.json`.

Passed checks include:

- Correct/incorrect login, strict origin checks, request-size limits, malformed requests, anonymous API denial, and secure HttpOnly/SameSite/Secure cookie attributes.
- Parameterized inquiry storage, spam/field validation, notification-unconfigured state, status updates, and formula-safe CSV export.
- Session hashing, logout replay rejection, server-side expiration, and credential-version invalidation.
- Real pageview/session/visitor aggregation, daily counts, referral sanitization, campaign privacy filters, allowed public paths, engagement events, and 7/30/90-day ranges.
- Application-process restart preserved saved inquiries, statuses, and analytics.
- Database-backed atomic rate limiting and failed-login lockout.
- Configured retention removed old traffic/inquiries and expired security records in the QA database.
- Optional email request format, idempotency header, success, provider failure, and network failure with mocked provider responses. No real email was sent.

A separate live-mode production build was also tested in Chromium. Before consent and after decline, no pageviews were stored. Opt-in produced real database pageviews. DNT and GPC suppressed collection even after an allow action. A production inquiry saved successfully while browser storage was blocked, with no browser runtime errors.

## Preview isolation

`preview-results.json` confirms that the presentation database has **zero inquiries and zero analytics events**. Preview estimate submissions created no records and sent no email; preview analytics created no events. Preview noindex response headers, metadata, and robots blocking were checked. Sample dashboard data is generated separately in memory.

## Remaining launch work and limits

- Owner confirmation is still needed for the phone, service scope/areas, owner story/portrait, genuine project photos, notification recipient, final domain, final copy, and privacy/retention approval. The exact checklist is in README.
- Render deployment and a custom domain have not been performed or purchased. The blueprint is prepared and based on current Render documentation, but hosted infrastructure, proxy behavior, HTTPS, email delivery, and domain SEO must be verified on the real deployment.
- Real email credentials were not supplied. Live mailbox delivery remains untested.
- A daily retention scheduler has not been provisioned; the command itself was tested.
- Responsive checks emulate the requested widths in Chromium on this computer. Physical phones, Safari/Firefox, assistive technologies, and external production load were not tested.
- This is a presentation-ready concept and implemented application, with owner-approved content and final operational configuration required before official launch.

## Local handoff

Public preview: http://localhost:3107

Private login: http://localhost:3107/admin/login

Read the ignored `.data/admin-access.txt` locally for generated credentials. No password is included in this report or chat. README contains restart, rotation, and deployment instructions.
