# Aspectori

A birth chart that shows its work: house-system comparisons, selected dated transits, focused calculators,
and a free downloadable PDF. Readings show the placements that produced them.

Aspectori is free software licensed under **AGPL-3.0-or-later**. The public service, complete corresponding source,
calculators and reports are free. The project has no advertising trackers, paid placements or locked calculations.

Personal charts automatically include **Your week ahead**, a free seven-day horoscope with up to three transit-based
themes, sampled contact dates, calculation evidence and reflection prompts. The server sets the UTC window and checks
six-hour samples within a 1° orb. Unknown birth times exclude Moon/Rising/Midheaven contacts and require both natal-day
endpoints to qualify. The current window refreshes on reopening, manually, or when an open tab crosses a UTC date.
These symbolic readings do not predict events. See `/method#week` for selection and sampling limits.

The searchable `/calculators` directory now includes ten tools: Venus, Mars, Moon, Rising, Big Three, birth Moon
phase, chart ruler, annual profections, house-system comparison and synastry. Results link between tools with birth
details in the private fragment. Lunar illumination is calculated by Swiss Ephemeris; annual profections use explicit
whole-sign/traditional-ruler conventions. Research and the 64-keyword opportunity map are in
`docs/seo/tool-opportunity-research-2026-10-20.md` and `docs/seo/tool-keyword-map-2026-10-20.csv`.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # all tests, including the Astro.com accuracy gate
npm run verify     # only the accuracy gate
npm run build
```

## Accuracy gate

`tests/astrocom.test.ts` checks 22 Astro-Databank charts (reference data in `src/data/astrocom-reference.json`,
also published at `/accuracy`) (1856–1986, five continents, local mean time, war time,
summer time). Two suites:

1. **Engine**: with Astro.com's own UTC offset, Sun, Moon and Ascendant must equal Astro.com's printed values to
   the arcminute. All 22 pass with zero tolerance.
2. **Time zones**: our offset (IANA + birthplace mean time before standard time) must equal Astro.com's atlas.
   20 of 22 agree. The two known differences are documented in the test: 19th-century railway mean times
   (Prague, Howrah) that the tz database cannot tell apart from local mean time. Users can set the offset by hand.

Add a chart to `src/data/astrocom-reference.json` whenever someone reports a mismatch.

## Famous charts data

- `src/data/famous.ts`: 21 curated charts with sourced birth times (Rodden AA–C), each tested against Astro.com.
- `src/data/people.json`: about 8,400 famous people from Wikidata (CC0): birth date and place, no time (Rodden X).
  Rebuilt from four Wikidata query exports in `data-src/` with `npm run data:import`. People whose Wikidata
  birth date is disputed are skipped rather than guessed.
- `src/data/people-summary.json`: precomputed Sun/Moon/aspect for each, so list pages never compute thousands of
  charts. Rerun `npm run data:summaries` after any engine change; a test fails if it is stale.

## SEO

- Keyword titles on every page: "Free Birth Chart Calculator", "[Name] Birth Chart", "[Sign] Zodiac
  Sign", "[Sun] Sun [Moon] Moon".
- Structured data: Organization, WebSite, WebApplication, Person and BreadcrumbList. Unsupported Google search-box
  and FAQ rich-result markup is deliberately omitted; visible search and FAQ content remains available to users.
- `sitemap.xml` lists core pages, guides, tools, and category pagination. `/charts/sitemap.xml` contains the 1,000-profile search-launch cohort; other profiles stay usable but carry `noindex, follow`. Every famous profile remains linked from a category page. Private `/report` is excluded and carries `noindex`; crawlers can access it to read that instruction.
- `/calculators` includes Moon, Rising, Big Three, house-system comparison and synastry tools; `/learn` supplies four supporting guides. `/birth-chart-report` is the public PDF landing page.
- `/about`, `/method`, `/accuracy`, `/contact`, `/privacy`, and `/terms` form the public trust and operator-information layer.
- Keywords map to useful pages, not duplicate pages for synonyms. FAQ content remains visible without obsolete FAQ rich-result markup.
- Unknown URLs under dynamic routes return a real 404 (`src/proxy.ts`).
- After launch, set `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` and submit the sitemap in both webmaster tools. These tokens are useful, but do not block a safe production build.

## How it fits together

| Path | What |
| --- | --- |
| `src/lib/astro/engine.ts` | Swiss Ephemeris (server only): natal chart, unknown-time ranges, couple contacts, year scan |
| `src/lib/astro/time.ts` | Local clock time → UTC: historical offsets, DST gaps and overlaps, local mean time, manual override |
| `src/lib/astro/aspects.ts` | Orbs, and endpoint-sampled aspects when the time is unknown; matching samples are not a full-day guarantee |
| `src/lib/astro/library.ts` | The fixed text library. Nothing is generated at request time |
| `src/lib/astro/reading.ts` | Assembles card lines and the "why this sentence" rows |
| `src/app/api/*` | Calculation endpoints, city search, and rate-limited contact-form delivery |
| `src/components/*` | Card, wheel, reading rows, houses table, couple card, year, printable report |
| `ephe/` | Swiss Ephemeris data files (1800–2400). Must ship with the functions |

Birth data lives in the URL fragment (`/#b=…`). Browsers do not send the fragment with ordinary HTTP requests.
Calculations send the entered values in POST bodies; the application does not write those bodies to a database or
application logs. Hosting infrastructure can still process technical request logs as described on `/privacy`.

## Before launch

- **Swiss Ephemeris license.** The public repository and deployed service use the AGPL path. `LICENSE` contains the
  project license and `NEXT_PUBLIC_SOURCE_URL` points every user to the complete corresponding source.
- **Geocoder use.** Aspectori is free, open source, ad-free and noncommercial. It uses Open-Meteo's open-access
  geocoder within the published limits and identifies that use with `GEOCODER_USE_MODE=noncommercial`. If the funding
  model changes, review the provider terms before deployment rather than silently retaining this setting.
- **Rate limiting.** The API has a per-instance limit. Vercel also has an active production `/api/` rule at 60
  requests per 60 seconds per IP; keep that edge rule published and verify it after deployment changes.
- **Contact delivery.** Verify `aspectori.com` with Resend, use a domain sender in `CONTACT_FROM_EMAIL`, and keep
  `RESEND_API_KEY` server-side. Messages go to `CONTACT_RECIPIENT_EMAIL` (currently `support@karai.bg`) and use the
  visitor's address only as Reply-To.
- **Release configuration.** Fill every production field in `.env.example`, then run `npm run release:check`. It blocks
  placeholder domains, incomplete privacy information, a missing public AGPL source URL, a geocoder whose declared
  use mode does not match its endpoint, and an unconfirmed edge rate-limit rule.
- **Report offer.** `/report#b=…&hs=…` is free for everyone now. It generates a PDF in the browser with selectable text, an embedded Noto Sans font (SIL OFL in `public/fonts/OFL.txt`), a chart wheel, placements, readings, major aspects and selected transits. No checkout, signup, email or feature flag is required. The font and PDF generator load only when exporting. `src/lib/report.ts` owns the current offer; a future paid release needs real server-side entitlements and checkout, not a hidden button or a changed label.

## Deploy (Vercel)

Import the `domusfor/aspectori` GitHub repository into Vercel as a Next.js project. `vercel.json` uses `npm ci`,
runs the verified production build, and gives the calculation API functions a 60-second ceiling. `sweph` ships
prebuilt Linux binaries and is excluded from bundling (`serverExternalPackages`); the `ephe/*.se1` files are traced
into the API functions (`outputFileTracingIncludes`).

Preview deployments build without production secrets. A Vercel production build runs `npm run release:check` first
and stops until every required production value in `.env.example` is configured. Search-engine verification tokens
remain optional until the webmaster accounts are created. After connecting the repository, add the required variables,
configure and test the `/api/*` firewall rate limit, set
`EDGE_RATE_LIMIT_CONFIRMED=true`, and redeploy. GitHub Actions independently runs lint, type checking, tests, and a
full build on `main` and pull requests.

## Product review

After a chart is created, the connection hub automatically suggests six famous charts with shared Sun, Moon or Rising placements. `POST /api/matches` compares the cached collection and distinguishes definite and possible overlaps. Suggestions indicate similarity of placements, not romantic compatibility. Selecting a suggestion preserves the user's input and opens a full comparison.

The same hub accepts a partner, friend, family member or another person, with an optional label. Relationship context changes reflection prompts, not the astronomy. Birth details and labels remain in the URL fragment; no database or analytics storage was added. All qualifying comparison contacts can be filtered by topic, and a comparison PDF includes the selected person.

Comparisons now also include **house overlays in both directions**, showing whole sign and Placidus side by side.
The receiving chart needs a known birth time. When only the visiting planet owner's time is unknown, rows show
explicitly labelled start/end samples, without claiming full-day assignments. Polar Placidus remains unavailable.
The same results appear in the free comparison PDF. See [the house-overlay review](docs/house-overlays-2026-10-27.md).

The PDF now uses an editorial layout with a navy cover, chart overview, element counts, planetary table, readings with evidence and prompts, aspects, transit windows, a glossary and a calculation record. Noto Sans regular/bold and Noto Serif are embedded on demand under the bundled OFL license. See [the connection and PDF review](docs/connections-and-atlas-2026-10-18.md).

See [the October 2026 review](docs/product-review-2026-10-17.md) for the usability, validation, accessibility, and reliability improvements and the verification performed.

The [SEO and product strategy](docs/seo/strategy-2026-10-18.md), [competitor review](docs/seo/competitor-review-2026-10-18.md), and [518-keyword research map](docs/seo/keyword-research-2026-10-18.csv) document the next review. The free-report implementation supersedes the earlier report restriction.

The [27 October research and quality audit](docs/quality-audit-2026-10-27.md) records the mobile fixes, accessibility,
interaction, SEO and local performance checks, plus remaining release requirements. The expanded
[844-keyword map](docs/seo/keyword-master-2026-10-27.csv), [keyword strategy](docs/seo/keyword-strategy-2026-10-27.md),
and [24-product feature comparison](docs/seo/feature-research-2026-10-27.md) distinguish observed evidence from
unmeasured demand and future feature hypotheses.

The [30 October chart-explainer improvement](docs/preproduction-chart-explorer-2026-10-30.md) connects wheel selections
to accessible explanations of placements and aspects, with calculation evidence, interpretation and reflection prompts.

The [1 November preproduction release audit](docs/preproduction-release-audit-2026-11-01.md) records the clean build,
mobile Chrome, accessibility, security, dependency, and SEO results, and lists the external production facts still required.

Copyright (C) 2026 Aspectori contributors. Licensed under AGPL-3.0-or-later; see [LICENSE](LICENSE).
