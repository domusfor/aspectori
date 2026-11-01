# Quality and mobile audit — 27 October 2026

## Outcome

The local production build passes the automated layout, accessibility and interaction checks described below.
The defects found in this pass were corrected. This is a tested local baseline, not a claim of perfection or public
launch approval. Real-device behavior, production configuration and field performance remain to be verified.

Research accompanies the implementation: [844-keyword strategy](seo/keyword-strategy-2026-10-27.md),
[keyword CSV](seo/keyword-master-2026-10-27.csv), and [24-product feature review](seo/feature-research-2026-10-27.md).
The keywords are candidates, with evidence types recorded. Search volume, difficulty and CPC remain unmeasured.

## Corrections made

| Finding | Change and verification |
| --- | --- |
| Month text clipped in narrow birth forms, including the homepage's tablet layout | Month gets a full row in narrow containers; day/year share the next row. Wider forms retain three columns. All twelve month values fit at 320, 375, 430 and 768 CSS pixels in the interaction check. |
| Small mobile form controls and inconsistent header layout | Birth controls have a 48px minimum height and at least 16px text; unknown-time label and advanced summary have 44px minimum height. Header navigation uses the phone layout below 640px. Native-picker rendering and iOS zoom still require physical-device confirmation. |
| Comparison wheels too small when displayed side by side on phones | Wheels stack below the small breakpoint, with a 320px maximum width each. Numerical placements remain available separately. |
| Tables could scroll without receiving keyboard focus | Named, focusable scroll regions added to house comparison, accuracy and report tables. Keyboard focus checked in the mobile interaction run. |
| Weak report text contrast | Darkened the paper-theme muted and gold text colors. Report has no detected axe contrast violations in the checked state. |
| Category heading skipped a level | Profile cards accept the appropriate heading level; category listings now use h2. |
| Long profile-row metadata could resist wrapping | Allowed narrow rows to wrap. |
| Sky widget could remain in a loading state after failure | Added a ten-second timeout, visible error, retry and refresh. A prior successful snapshot remains available during a failed refresh. Forced HTTP 503 followed by retry passed. |
| “Live” sky copy implied continuously current positions | Describes a cached snapshot with a calculation timestamp and manual refresh. |
| Claims exceeded the available evidence | Replaced “Most searched” with “Featured names”; clarified uncertain famous birth times, endpoint sampling and selected annual transits across relevant UI, documentation and report copy. No new calculation algorithm was introduced in this audit. |

The initial axe run found scroll-focus issues on three states, a category heading-order issue, and report contrast
issues (the diagnostic capped stored contrast nodes at twelve). The initial native-select check found clipped month
labels. Decorative SVG extents and content inside intentional horizontal table scrollers are excluded from the content
overflow diagnostic; those exclusions are not presented as repaired layout defects.

## Verification evidence

| Check | Result and scope |
| --- | --- |
| Automated accessibility | **26 page states**, axe WCAG 2/2.1/2.2 A/AA tags and best practices at 375px: **zero detected violations**. This is not a complete WCAG conformance assessment. |
| Responsive layout | Same states at **320, 375, 390, 768 and 1440px**: 130 observations, no detected content overflow or clipped selected options. Includes personalized chart/comparison and report states. |
| Real calculation journeys | Ten calculators × known/unknown time = **20 successful result states**, actual POST endpoints, no-store responses, no nonempty error alerts; width checked at 320/390/430/768. |
| Mobile input/recovery | Native date selectors, touch birthplace selection, controlled geocoder failure/retry, calculation, directory empty/reset, famous search, table focus and forced sky failure/retry passed. |
| External geocoder sample | Separate unmocked Sofia query returned HTTP 200 and eight results. This single check is not an availability guarantee. |
| Free comparison PDF | Touch download succeeded: **306,470 bytes**, **30 pages**, **35,398 extracted text characters**. Both directions of house overlays and house-system labels verified through PDFKit; one overlay page visually reviewed. |
| Public SEO sample | **58 stratified sitemap pages**: HTTP 200, title, description, one h1, canonical pathname, no public noindex, parseable JSON-LD. Syntax checks do not establish rich-result eligibility. |
| Sitemap/privacy/404s | **8,704 unique URLs**; private report and API excluded; report noindex and crawlable; API disallowed; five invalid-route samples return 404. |
| JavaScript disabled | Homepage h1 and FAQ summary visible. Interactive calculations still require JavaScript. |
| Browser errors | None recorded in the layout or interaction runs. |
| Build/static analysis | Production build, ESLint, TypeScript and whitespace checks passed. |
| Unit/regression suite | **194 tests in ten files passed**, including the existing astronomy reference checks, on patched Vitest 4.1.12. |
| Dependency advisories | Final npm audit: **zero reported vulnerabilities** across production and development dependencies. This is an advisory-database check, not a penetration test. |

Stored evidence: [accessibility/layout JSON](qa/2026-10-27/accessibility-layout.json),
[mobile interaction JSON](qa/2026-10-27/mobile-interactions.json),
[SEO and performance JSON](qa/2026-10-27/seo-performance.json).
Visual samples: [375px birth form](qa/2026-10-27/birth-form-375.png),
[375px report cover](qa/2026-10-27/report-cover-375.png),
[PDF overlay page](qa/2026-10-27/pdf-overlay-page.png).

Browser checks used desktop Chromium with touch/mobile emulation and reduced motion, not Safari, Android Chrome on a
physical device, a screen reader or an accessibility user study. Screenshot review covered the form, stacked comparison
wheels, report cover and one exported overlay page; it did not manually inspect all 8,704 public URLs or every PDF page.
The saved birth data is a synthetic fixture.

## Development dependencies

The initial dependency scan reported three affected packages in the development test-runner tree (one moderate and
two critical package ratings, including inherited findings). Updated Vitest from 3.2.7 to **4.1.12**, with an explicit
**Vite 6.4.5** development dependency to keep the test stack compatible with Node 20. The test configuration now uses
`.mts` and an explicit file URL conversion so its ESM dependencies load correctly. The full 194-test suite, lint and
typecheck passed after migration. Application runtime dependencies were not changed by this migration.

The installed npm 10.5.0 crashed in optional-peer resolution; a temporary npm 10.9.4 completed the install without
replacing the system npm. The installer also reported the existing `eslint-visitor-keys` Node requirement (20.19+ in the
Node 20 line) against this machine's Node 20.11.1. Lint passed here, but use a supported Node release for reproducible CI;
the project's broad minimum engine declaration does not cover every current transitive development-tool requirement.

Evidence: [before](qa/2026-10-27/dependencies-before.json) and [after](qa/2026-10-27/dependencies-after.json).
References: [Vitest 4 migration guidance](https://v4.vitest.dev/guide/migration),
[mocker advisory](https://github.com/advisories/GHSA-qxg6-89mg-rqv8),
[Tinypool advisory](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3).

## Local loading sample

One cold local production navigation per route: 390×844 Chromium, 150ms simulated latency, 1.6Mbps download and 4× CPU
slowdown. These are diagnostic measurements, not Lighthouse scores or field Core Web Vitals. CLS below is the observed
sum during navigation; no field INP assessment was performed.

| Route | Observed LCP | Observed layout shift | Resource transfer bytes |
| --- | ---: | ---: | ---: |
| `/` | 1,148ms | 0.00207 | 529,520 |
| `/calculators/moon-sign` | 900ms | 0.00094 | 531,424 |
| `/charts` | 1,164ms | 0.00094 | 530,756 |

Resource transfer sums exclude the navigation document. There were seven font requests per sampled route. Local server
latency and simulated conditions cannot establish performance on the deployed network. These measurements precede the
final calculator uncertainty-copy correction; the subsequent interaction/layout run checked that correction.

## Remaining release checks

1. **Production origin and indexing.** No public URL or Search Console dataset was supplied. This build uses the
   development canonical origin `http://localhost:3000` and is previewed on port 3143. Set `NEXT_PUBLIC_SITE_URL` to the
   real domain before deployment, then verify canonical host, sitemap, robots, rendered content and indexing there.
2. **Physical phones and assistive technology.** Check iOS Safari and Android Chrome, native select pickers, keyboard
   opening, portrait/landscape, zoom, screen-reader order, scrolling tables, PDF save/share and reduced-motion behavior.
   Browser emulation does not replace these checks.
3. **Measured keyword demand.** Validate the 58-term shortlist with authorized US and UK datasets separately. The
   research supports prioritization hypotheses, not traffic forecasts or ranking guarantees.
4. **Deployment operations.** Resolve the existing Swiss Ephemeris/geocoder licensing decisions and production rate
   limiting described in the README. No licensing conclusion or deployment change was made by this audit.
5. **Field performance and usability.** Collect real-user loading/responsiveness evidence and observe people completing
   a first chart and comparison. Local test success alone cannot establish completion rates or comprehension.

The next product decisions are approximate-time sensitivity, a synastry biwheel/aspect matrix, deeper authored overlay
interpretations and famous-chart filters. Their requirements and evidence limits are in the feature review. They were
researched, not silently added during the quality pass.

## Reproduce the browser checks

Run a production build and `npm run start -- --port 3143`. With Playwright/Chromium and axe-core available, run:

```sh
node scripts/audit-quality.cjs
node scripts/qa-mobile.cjs
node scripts/audit-seo-performance.cjs
```

`PLAYWRIGHT_MODULE` can point to an existing Playwright installation; `AUDIT_BASE_URL` overrides the local origin.
The layout runner supports `AUDIT_OUTPUT_DIR`. Its JSON is diagnostic and must be inspected for nonempty findings;
the mobile and SEO scripts assert their checks. This session used an existing external Playwright installation and
the locally available axe-core. These audit tools are not installed as project dependencies by these commands.
