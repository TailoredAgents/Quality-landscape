# Loading speed and SEO audit

Checked October 20, 2026. Public address: https://quality-landscape.onrender.com.

## Measured findings

Lighthouse 13.5.0 mobile simulation was run against the optimized production server. These are lab measurements, not real-user Core Web Vitals or ranking guarantees. Local and hosted runs must not be compared as if they used the same network.

| Local mobile lab measurement | Before | After, cached image derivatives |
| --- | ---: | ---: |
| Performance score | 95 | 95 |
| Largest Contentful Paint | 3.0 s | 2.9 s |
| Total Blocking Time | 20 ms | 20 ms |
| Cumulative Layout Shift | 0.001 | 0 |
| Total transferred | 654 KiB | 353 KiB |
| Image transfer | 341 KiB | 85 KiB |
| JavaScript transfer | 207 KiB | 162 KiB |

The page transfer fell about 46%, image transfer about 75%, and JavaScript transfer about 22%. The first local run generating new AVIF derivatives scored 90 with 3.5 s LCP; cached derivatives scored 95 with 2.9 s LCP. AVIF encoding has a first-request cost, so the image cache is important. Detailed unredacted public-page Lighthouse reports are stored locally under ignored `.data/performance/`.

The separate initial hosted run scored 87 for performance, 100 for best practices, and 69 for SEO, with LCP 3.7 s, TBT 30 ms, and CLS 0. Its canonical URL incorrectly pointed to `http://localhost:3107`. It also emitted noindex in both HTML and HTTP headers, blocked crawlers in robots.txt, and supplied an empty sitemap. The crawl block is intentional until launch, and remains enabled; it explains the SEO score, which should not be presented as a ranking score.

After Render deployed `f1503e8`, the hosted mobile test scored **94 for performance**, with **2.6 s LCP**, **20 ms TBT**, **0 CLS**, and **338 KiB transferred**, versus 640 KiB before. The public canonical URL now correctly points to the Render origin. The six-page SEO audit also passed on the live address. Indexing remains disabled, so the SEO category is still 69. These are individual simulated runs; they do not establish real-user performance.

## Mobile scrolling correction

The owner reported the home-page hero extending when scrolling on mobile. This was reproduced at 390 px width: increasing viewport height from 760 to 890 px grew the hero from 684 to 814 px and moved the following section by 130 px. Mobile sizing now follows its content and fixed spacing rather than viewport height. A regression check at 375, 390, 430, and 700 px verifies the hero and following section stay at the same document positions when viewport height expands and contracts while scrolled.

## Implemented

- AVIF image delivery with WebP fallback, smaller thumbnail requests that match the actual columns, quality 60 for page images, and a one-day minimum derivative cache. Detailed lightbox images retain quality 75. Replace photographs using new filenames to avoid stale image-cache entries.
- Hero image preloading with high fetch priority. Below-the-fold photographs remain lazy-loaded.
- Preloaded local Latin variable fonts, with adjusted fallback metrics. No external font requests.
- Native browser reveal animations with reduced-motion support, replacing the Motion runtime. Content remains visible with JavaScript disabled.
- Canonical origin set to the provided Render URL in the Blueprint. The configuration also falls back to Render's public URL and rejects copied localhost values when running on Render. A future custom domain takes precedence.
- Location-specific service-page title, social sharing metadata, and public identity URLs in the existing launch-gated structured data.
- A repeatable audit verifies that six public pages return 200, render one H1 without JavaScript, include titles/descriptions/correct canonical URLs/image alt attributes, and keep the private login excluded from search.
- The dashboard regression test now checks persisted real metrics rather than assuming its real database is empty. No existing records were deleted.

Validation: production build, ESLint, ten unit tests, nine Playwright tests including mobile viewport stability and accessibility checks, and the six-page server-rendered SEO audit pass.

## Launch and ongoing work

1. Connect the final custom domain to Render. Update `NEXT_PUBLIC_SITE_URL` in `render.yaml` to that HTTPS origin and rebuild. Confirm canonical tags and sharing URLs use it. Set permanent redirects from alternate domain variants to the chosen domain.
2. Confirm the business phone, actual service scope/areas, and published copy. Enable the existing launch flags in `src/lib/business.ts` and set `PREVIEW_MODE=false` when ready for real inquiries. These flags control indexing, sitemap contents, and structured data; changing only the preview environment value is insufficient.
3. Verify the public launch has no noindex header/meta, permits public crawling, exposes the five intended URLs in `/sitemap.xml`, and keeps admin/API paths private. Run `npm run audit:seo -- https://YOUR-DOMAIN`.
4. Verify the final domain in Google Search Console, submit the sitemap, and inspect the main URLs. Check structured data with Google's Rich Results Test. The current city-only business address must not be represented as qualifying for every LocalBusiness rich-result feature; supply only verified, appropriate public business details.
5. Complete and verify the owner's Google Business Profile, link the final website, and keep business name, phone, service area, category, and hours consistent. Add genuine project photos and request genuine customer reviews. Do not invent reviews or produce repetitive city pages for areas the company does not serve.
6. Recheck mobile and desktop PageSpeed Insights after deployment and significant image/content changes. Monitor Search Console real-user data when sufficient traffic exists. Google recommends LCP within 2.5 s, INP below 200 ms, and CLS below 0.1. Lab TBT is a responsiveness diagnostic, not a measured INP. The current mobile LCP still has room to improve.

The temporary Render address remains unindexed. Speed work does not require purchasing a domain, but Google visibility requires intentionally enabling indexing when the site is ready.

## References

- [Google: Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)
- [Google: Improve local ranking](https://support.google.com/business/answer/7091)
- [Google: LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Render: Public origin environment variable](https://render.com/docs/environment-variables)

Reproduce a mobile lab run from PowerShell, with the production server running:

```powershell
$lighthouseChromePath = node -e "console.log(require('@playwright/test').chromium.executablePath())"
npm exec --yes --package=lighthouse@13.5.0 -- lighthouse http://localhost:3107/ --chrome-path="$lighthouseChromePath" --chrome-flags="--headless --no-sandbox" --only-categories=performance,seo,best-practices --output=json --output-path=.data/performance/mobile.json --quiet
```

Use `--preset=desktop` for a separate desktop run. Warm the image derivatives first when comparing cached runs, and also record a cold run rather than hiding its encoding cost.
