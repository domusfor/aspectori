# Free tool expansion — 20 October 2026

Local production preview: <http://localhost:3143/calculators>.

Five new calculators bring the focused collection to ten: Venus sign, Mars sign, birth Moon phase,
chart ruler and annual profections. The directory has search/category filters. Personal charts and
calculator results offer links that carry birth details between tools without re-entry.

Research: [17-product review](seo/tool-opportunity-research-2026-10-20.md) and
[64 proposed keyword variants](seo/tool-keyword-map-2026-10-20.csv). Volumes and difficulty remain unmeasured;
Ahrefs was suggested but no connection was confirmed. Existing research was preserved.

## Implementation

- The existing chart endpoint supplies Venus/Mars placements, uncertainty ranges, timed motion and houses.
- `POST /api/birth-moon` uses Swiss Ephemeris illuminated fraction. Unknown times are sampled hourly over the
  local day, including endpoints and DST-shortened/lengthened days. Ranges are labelled as sampled values.
- Chart rulership exposes named traditional/modern schemes and the actual natal ruler placements.
- Annual profections use age modulo twelve, whole-sign counting and traditional rulers. The interactive
  age cycle preserves unknown-time limits. February 29 uses February 28 in non-leap years, stated explicitly.
- New routes include unique metadata, canonical URLs, original explanatory content, source references,
  free WebApplication structured data and sitemap inclusion. Unknown calculator paths still return 404.
- The new tool results are on-screen. The free PDF continues to be the existing birth-chart report.

## Verification

- **185 tests passed across 9 files**, including 27 new tests covering primary lunar reference dates,
  UTC equivalence, DST samples, phase boundaries, birthday/leap-day cases, invalid ages, missing times,
  rulership conventions, input validation and personalized-response caching.
- ESLint, TypeScript and the production build passed.
- Production-browser checks passed at widths 320, 375, 768 and 1440 with no horizontal overflow.
- All five known-time and unknown-time results were checked, together with directory search and filter reset,
  age editing and cycle selection, birth-detail link preservation, canonical paths, free schema,
  calculation failure/retry, sitemap inclusion and invalid-route 404 behavior.
- Existing weekly readings and famous suggestions still load. The actual PDF download from a new tool's
  result contains 19 pages and 20,021 selectable text characters for the synthetic QA birth.
- Desktop results, directory and mobile layout were visually inspected. No browser page errors were recorded.

Browser runner: `/tmp/aspectori-tools-qa.cjs`. Screenshots: `/tmp/aspectori-tools-directory.png`,
`/tmp/aspectori-tool-{venus-sign,mars-sign,moon-phase,chart-ruler,annual-profections}.png`, plus mobile captures.

No dependencies, paid gates or analytics integrations were added. No commit or public deployment was made.
