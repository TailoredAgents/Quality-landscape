# Basic analytics — October 21, 2026

The public analytics popup has been replaced with automatic first-party page counts. New pageview events contain an allowlisted page path, referral hostname, restricted campaign labels, broad device category, and timestamp. Requests omit cookies. No visitor/session identifiers, engagement timers, fingerprinting, or browsing journeys are generated.

The private dashboard now shows total pageviews, active pages, mobile pageviews, saved quote requests, daily activity, popular pages, referral sources, devices, and campaigns. Visitor/session estimates, landing journeys, time on page, and person-level conversion rates were removed from both real and illustrative sample data. Repeat pageviews count separately, and privacy settings, blockers, and bots affect totals.

Privacy & preferences retains an optional pause/resume control. The only new browser preference is a non-identifying disabled flag when someone pauses statistics. Earlier declines remain paused; legacy browser visitor/session IDs are removed on return. Browser Do Not Track and Global Privacy Control suppress collection on client and server. Statistics and inquiry submission work when browser storage is unavailable. Private administration remains protected by its existing necessary session cookie.

No database migration is needed. Nullable legacy analytics columns remain for compatibility, and historical permission-based records follow the existing retention policy. New events leave those identifier/duration columns empty. The endpoint rejects visitor/session fields, engagement events, arbitrary/private paths, and client-supplied conversions. Inquiry storage and confirmed conversion events remain separate from traffic and contain no browsing identifiers.

Verification:

- Production build and ESLint passed; eleven unit tests passed.
- Ten Chromium regression tests passed, including accessibility, public/mobile pages, the photo viewer, form feedback, protected administration, exports, and dashboard containment.
- Isolated PostgreSQL integration and live-mode browser checks passed: automatic page counts, no popup, no identifiers or cookies in analytics requests, SPA navigation counted once, old identifier cleanup, preserved declines, pause/resume, DNT/GPC, aggregation at 7/30/90 days, and inquiry persistence with browser storage blocked.
- Private dashboard screenshots at 375, 430, 768, and 1440px have no horizontal overflow or browser exceptions.
- WebKit: 24 public-route/viewport checks, stable mobile hero, navigation, and form input passed. Final phone privacy checks at 320, 375, and 430px verify automatic identifier-free requests, cookie omission, empty default browser storage, readable controls, and no overflow. Automated WCAG A/AA checks through the WCAG 2.2 tags report no violations at 375px.

Run `npm run build`, `npm test`, and `npm run test:browser` with the production server running. `node scripts/test-live-browser.mjs` builds an isolated live-mode copy and runs database plus privacy browser checks without using the business inquiry tables or sending email. Screenshots and raw reports remain under ignored local QA paths.

This describes the implemented data minimization and behavior; it is not a universal legal-compliance certification.
