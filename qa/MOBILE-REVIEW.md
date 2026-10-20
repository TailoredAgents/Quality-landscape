# Mobile presentation review — October 20, 2026

**Overall editorial score: 95/100 for the October 21 client presentation, improved from 86/100.** This is a judgment of the complete mobile experience, not an automated certification or a search-ranking score.

| Area | Before | After | Maximum |
| --- | ---: | ---: | ---: |
| Visual design and brand | 19 | 19 | 20 |
| Readability | 15 | 19 | 20 |
| Mobile layout and touch interactions | 18 | 20 | 20 |
| Demonstration workflows | 16 | 19 | 20 |
| Accessibility and browser checks | 9 | 9 | 10 |
| Loading performance | 9 | 9 | 10 |
| Total | 86 | 95 | 100 |

## Scope and improvements

Reviewed the complete Home, Services, Our Work, About, Contact, and Privacy pages, plus the private login and dashboard. Public layouts were reviewed at 320, 375, and 430 CSS pixels; broader regression coverage includes tablet and desktop. The existing hero scrolling fix remains in place.

- Increased mobile body text, form labels, navigation, and dashboard text. Inputs use 16px text to avoid iOS focus zoom.
- Added a 44px call button in the phone header. Menu closes on Escape, outside taps, navigation, and logo taps; Escape restores toggle focus.
- Made gallery filters a two-column touch-friendly grid. Photo viewer controls remain within a 320 × 700 viewport.
- Moved the estimate form ahead of contact details and the decorative photograph on phones. Fields use a single column, explicit labels, associated errors, and focused validation/success feedback. Errors preserve entered details.
- Fixed private-login/dashboard wordmark spacing so the grass Q remains attached to UALITY.
- Updated the Render Blueprint to enable durable inquiry storage while retaining the clearly labeled private sample dashboard. Search indexing remains disabled for the presentation. This Blueprint environment change must be applied by Render before hosted storage is enabled.

## Evidence

- Production build and ESLint pass; ten unit tests pass.
- Ten Chromium browser tests pass, including public routes, images, stable hero sizing, menu behavior, form success/error states, protected APIs, private dashboard controls, export, logout, and accessibility. The changed narrow-screen lightbox and login accessibility checks were repeated after the final CSS refinement.
- WebKit: 24 route/viewport checks pass across all six public pages at 320, 375, and 430px portrait and 844 × 390 landscape. Hero height remains stable; actual menu navigation and form entry pass without browser exceptions. This is engine emulation, not a physical iPhone test.
- Public mobile review: no horizontal overflow, broken images, or reported browser exceptions. Automated WCAG A/AA checks, including WCAG 2.2 tags, report zero violations at 375px. Small decorative labels and secondary captions remain intentionally smaller than body copy. Automation cannot establish full accessibility compliance.
- Private screenshots and containment checks pass at 375, 430, 768, and 1440px.
- Isolated PostgreSQL integration checks pass for inquiry storage, status changes, CSV export, authentication, persistence after restart, analytics, retention, and security controls. Optional email behavior is tested with mocked provider responses. No fictional customer inquiries were added to the live business database and no real email was sent.
- Six server-rendered public SEO checks pass; private login stays excluded from search.
- Final local production Lighthouse 13.5 mobile run: **95 performance**, **100 best practices**, LCP **2.9s**, TBT **10ms**, CLS **0**, transfer **354 KiB**. This is a simulated lab run with cached image derivatives, not real-user field data. SEO is 69 because the presentation intentionally blocks indexing. Earlier deployed speed results are recorded in `qa/SPEED-SEO.md`.
- Render deployment `9622ea7` verified: all six public pages have no horizontal overflow or browser exceptions at 375px; the phone call button and form-first layout are present. Expanding viewport height from 812 to 940px leaves the hero unchanged at 664.8px. Invalid quote input returns 400 without saving a lead. Render now renders `preview:false` and displays the consent banner, confirming that the Blueprint storage-mode change applied. A valid hosted inquiry was deliberately not submitted; durable persistence was tested in the isolated local database.
- Final hosted Lighthouse 13.5 mobile run: **96 performance**, **100 best practices**, LCP **2.5s**, TBT **20ms**, CLS **0**, transfer **344 KiB**, no run warnings. SEO remains 69 because indexing is intentionally disabled. These are single simulated measurements and can vary between runs.

Reproduce the additional reviews with a production server running:

```powershell
node scripts/mobile-review.mjs after
node scripts/mobile-webkit.mjs
npm run test:browser
npm run test:backend
npm run audit:seo
```

Screenshots, raw Lighthouse data, and detailed route measurements are retained locally under ignored `.data/` and `qa/*.png` paths.

## Remaining presentation and launch work

1. Physically check scrolling, menu, photo viewer, and keyboard entry on the actual phone used for the presentation. Emulators cannot reproduce every mobile browser toolbar and keyboard interaction.
2. Configure and verify the notification sender before promising emailed lead alerts. Saved inquiries are available through the private dashboard once hosted storage is enabled; email delivery remains unverified.
3. Replace landscape inspiration photography with genuine company projects when available. Confirm the owner's phone, service scope, and published business details.
4. Connect the future custom domain and intentionally enable the existing launch flags before seeking search traffic. The temporary presentation address remains unindexed.

Suggested demo: Home → menu → Services → a service estimate link → submit an authorized inquiry → private dashboard sample tour → switch to real data to show the saved inquiry. Sample status changes and sample exports are explicitly illustrative and remain separate from real records. Do not present sample analytics as actual business traffic.
