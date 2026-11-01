# Comparison house overlays — 27 October 2026

Continues the product-depth priority identified in the [tool research](seo/tool-opportunity-research-2026-10-20.md).
The existing personal/famous comparison hub and `/calculators/synastry` now include house overlays. Local preview:
<http://localhost:3143/calculators/synastry>. No commit or public deployment was made.

## Behavior

- Two explicitly labelled directions: their planets in your houses, and your planets in theirs.
- All ten planets, Sun through Pluto; whole sign and Placidus shown separately. Angles, Chiron and node are excluded.
- Expandable planetary degrees and receiving-chart cusp degrees let users inspect each assignment.
- House sectors use ecliptic longitude. A cusp belongs to the house starting there. No cusp orb or planetary-latitude
  correction is applied. The shared sector helper retains the existing natal-chart algorithm.
- Unknown receiving birth times leave that direction unavailable. Unknown visiting birth times show the local-day
  start and end separately, in chronological order, even when both samples occupy the same house. These are not
  continuous bounds or a guarantee that the house was unchanged throughout the day.
- Polar Placidus stays unavailable only in the affected direction; whole sign still works.
- Both directions and the same uncertainty wording appear in the printable report and downloadable free PDF.
- Synastry metadata, public explanations, FAQ and the aspects guide now describe the feature. `/method#house-overlays`
  documents the convention and links to [Cafe Astrology's introduction](https://cafeastrology.com/articles/synastryplanetsinhouses.html).

The two existing wheels remain individual charts. A shared biwheel and planet-in-house interpretations are separate
future work. No compatibility percentage, extra API request, dependency or storage integration was introduced.

## Verification

- 194 tests across 10 files pass, including all 65 Astro.com reference checks. Nine new tests cover exact cusp boundaries,
  zodiac wrap, unequal sectors, independent whole-sign counting, directionality, natal parity, unknown-time endpoints,
  retrograde endpoint ordering, polar behavior and report consistency.
- ESLint and TypeScript pass. The production build passes after removing a cached sandbox worker-port failure.
- Browser checks against the production server cover widths 320, 375, 768 and 1440 without page overflow; twenty
  planetary rows with known times; expandable boundaries; one/both unknown times; polar directionality; the personal
  comparison hub; carried birth fragments; report uncertainty text; public FAQ content; and actual PDF download.
- No uncaught browser errors. Desktop and mobile overlay captures were visually inspected.
- The downloaded synthetic comparison PDF has 30 pages and 35,447 selectable text characters. PDFKit extraction
  confirmed both overlay sections and house results; the first overlay page was rendered and visually inspected.

QA runner: `/tmp/aspectori-overlays-qa.cjs`. Captures: `/tmp/aspectori-overlays-{320,375,768,1440}.png`.
Downloaded PDF: `/tmp/aspectori-overlays-comparison.pdf`. Synthetic birth data only.
