# Keyword strategy — 27 October 2026

## Deliverables and evidence boundary

- [Master CSV](keyword-master-2026-10-27.csv): **844 deduplicated candidate terms in 36 clusters**.
- [Validation shortlist](keyword-validation-shortlist-2026-10-27.csv): **58 terms**, selected for a first country-specific measurement pass.
- [Search evidence](search-evidence-2026-10-27.json): **46 individually logged searches** and **13 direct page-open attempts**.
- [Feature research](feature-research-2026-10-27.md): **24 products**, advertised capabilities and a prioritized capability matrix.

This consolidates the 18 and 20 October maps, removes duplicate phrases, updates implemented overlays, adds task-focused
variants and removes misleading destinations from unimplemented time-range tools. **282 rows carry the new review date**;
that includes refreshed terms, not only newly discovered keywords. There are 24 exact searched-query rows (across research
dates), 580 inferred variants and 240 enumerated coverage hypotheses. The latter include existing Sun/Moon combinations
and celebrity subjects; enumeration does not prove demand. The 46 searches include competitor and standards queries,
so they do not correspond one-to-one to keywords in the CSV.

Monthly volume, organic difficulty and CPC are blank. Ahrefs was discovered but was not connected during the research.
The search sample is not a country-controlled Google ranking study. No traffic forecast, search-volume estimate or
claim that any keyword is easy has been fabricated. Related source links document an intent or feature; they do not
imply that every inferred phrase was present in the source or independently searched.

The working market remains English-language US/UK users, pending owner confirmation. Keep country datasets separate.
Record provider, country, language, date range and retrieval date when adding metrics. Advertising competition is not
organic keyword difficulty. Do not combine worldwide volume with a country-specific ranking estimate.

## Page ownership

| Intent / leading candidates | Primary destination | Action |
| --- | --- | --- |
| Free birth chart, natal chart calculator, exact degrees | `/` | Protect the main calculation journey and public explanation; consolidate synonyms here. |
| Free PDF, printable birth-chart report, no-email download | `/birth-chart-report` | Explain the actual export and show an example; personalized `/report` remains noindex. |
| Moon sign with/without time | `/calculators/moon-sign` | Explain endpoint uncertainty and link to the missing-time guide. |
| Rising sign, Ascendant degree | `/calculators/rising-sign` | Exact-time task; do not imply it supports a time interval. |
| Sun Moon Rising, Big Three | `/calculators/sun-moon-rising` | Distinct three-placement answer and a path to the full chart. |
| Venus sign / Mars sign | Existing Venus and Mars calculators | Keep results, motion and houses clear; no extra synonym URLs. |
| Birth Moon phase / birthday illumination | `/calculators/moon-phase` | Show the calculated phase and sampling limits; avoid soulmate-percentage claims. |
| Chart ruler / traditional versus modern ruler | `/calculators/chart-ruler` | Explain the convention; distinguish dominant-planet weighting. |
| Annual profections / time lord / house year | `/calculators/annual-profections` | Keep age, birthday interval and traditional ruler explicit. |
| Whole sign versus Placidus calculator | `/calculators/house-systems` | Tool intent; the separate guide owns the conceptual explanation. |
| Synastry, friendship comparison, house overlays | `/calculators/synastry` | One useful comparison destination. Overlays now exist; a shared biwheel still does not. |
| Missing birth time | `/learn/birth-chart-without-birth-time` | Educational intent with a direct route to an honest calculation. |
| Reading a birth chart | `/learn/how-to-read-a-birth-chart` | Add an original annotated example after validating reader comprehension. |
| Aspect/orb questions | `/learn/aspects-and-orbs` | Explain our actual limits and why calculators disagree. |
| Weekly personal horoscope | Existing personal-chart workflow on `/` | Test discoverability first; no generic sign-by-day page factory. |
| Celebrity/name charts | Existing profile and directory routes | Prioritize source quality and useful filters, not catalogue size. |
| Solar returns, progression, astrocartography, sidereal | No new target page | Validate and implement the capability before targeting a tool intent. |

There are 685 rows with an existing destination and 159 unmapped backlog rows. An existing destination does not mean it
fully answers every long-tail question: some rows explicitly mark partial coverage or missing advanced filters. Check
the `product_status` and `action` fields before using any row as a content brief. P0/P1 is product fit, not measured demand.

## What the research suggests

1. Free charts, no-signup entry and PDFs are common. Lead with inspectable results and usable uncertainty rather than
   claiming those baseline features are unique. See the linked competitor matrix for first-party evidence.
2. Relationship searches include friends, family and house direction. The current comparison page can serve those
   tasks without creating separate near-duplicate romantic/friendship calculators.
3. “Why do apps disagree?” and birth-time uncertainty connect to the existing house and historical-time work.
   These are promising relevance hypotheses; they still need demand and comprehension measurements.
4. Returns and calendars are substantial feature gaps, but broad tools bring calculation risk. Avoid launching thin
   pages that imply the existing selected-transit output is a full calendar or exact-return solver.
5. Mobile completion is a prerequisite. A visible month label and working PDF flow matter more than stuffing another
   modifier into a title.

## Measurement and acceptance

Import the shortlist into an authorized keyword provider for US and UK English separately. Add volume and seasonality,
record organic competitors for the top task clusters, and manually inspect intent before prioritizing new work.
After public launch, use Search Console query/page/country evidence to check whether the intended landing pages receive
impressions. Evaluate guide-versus-calculator cannibalization from actual results, not URL similarity alone.

Keep public content, headings and metadata equivalent across responsive layouts. Google documents the importance of
[mobile content parity](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing).
Measure real-user loading, responsiveness and layout stability once a public URL has sufficient data; local lab tests
are not field [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals).

Before public SEO sign-off: verify the real canonical origin, sitemap and robots on the deployment; inspect sampled
rendered URLs; confirm webmaster access and indexing evidence. The local build currently uses its configured development
origin. No public domain or Search Console dataset was supplied in this audit.

No ranking guarantee, public deployment, outreach campaign or automatic page generation is part of this delivery.
