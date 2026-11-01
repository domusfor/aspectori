# Tool opportunity research — 20 October 2026

## Decision

Add five free, working tools: Venus sign, Mars sign, birth Moon phase, chart ruler and annual profections.
These extend existing chart calculations into distinct tasks and introduce two additional calculation workflows:
lunar illumination and an explorable twelve-year profection cycle. The directory now contains ten focused tools.
The full personal chart, weekly reading, famous matches, personal comparison and free PDF remain available.

This is a qualitative feature and search-intent review. It does **not** establish search volumes, keyword difficulty,
market share, conversion rates, comprehensive competitor coverage or that Aspectori is the best product.

## Evidence and scope

The review submitted 28 web-search queries covering feature inventories, focused calculator searches, relationship
products, timing tools and lunar calculation references. It also attempted six direct page opens. Official product
pages and publishers' own tool descriptions were the basis for feature comparisons. NASA and Swiss Ephemeris
documentation informed the lunar method; the independent timeanddate October 2026 phase table supplies test fixtures.

Limitations: Astro-Seek's direct home fetch returned 403; its indexed official tool directory supports only a broad
inventory observation. Some Astrodienst direct opens showed a browser check, while indexed official article text
was available. Competitor subscriptions and checkout flows were not purchased or tested. Described competitor
features are advertised capabilities, not independently verified output quality. Existing research from 18 October
is retained; this report adds the next tool decision rather than replacing that audit.

Ahrefs was found in the plugin directory and suggested, but is not connected. No volume, difficulty or traffic numbers
were invented. The companion CSV contains **64 proposed keyword variants across 11 intent clusters**; they are mapped
from observed features and selected calculator searches, not 64 independently measured keywords. Blank metric columns
mean unmeasured. Synonyms share one destination; backlog terms do not receive empty landing pages.

## Seventeen-product comparison set

| Product | Observed public feature evidence | Consequence for Aspectori |
| --- | --- | --- |
| [Astro-Seek](https://horoscopes.astro-seek.com/astro-seek-tools-search/?no_mobile=1&tool_jmeno=calendar) | Indexed official directory lists calendar, return, transit and traditional-tool categories; direct access limited | Breadth benchmark only. Do not claim equivalent calculation coverage. |
| [Astrodienst](https://www.astro.com/horoscopes) | Extended chart selection, ephemeris creation and travel tools | Advanced chart controls and relocation are substantial future projects. |
| [Astrotheme](https://www.astrotheme.com/faq.php) | Detailed conventions for dominance and compatibility calculations | Clearly distinguish chart rulership from a weighting-based dominant-planet score. |
| [Cafe Astrology](https://cafeastrology.com/astrologytoolstables.html) | Planet sign tables, free reports and focused sign tools | Add direct Venus/Mars entry points with clear uncertainty and an onward chart journey. |
| [CHANI](https://www.chani.com/app?view=home) | Birth readings, transit themes, weekly content and reflection features | A return visit needs understandable context; retain the existing weekly view and practical prompts. |
| [Co–Star](https://www.costarastrology.com/faq/) | Social charts, friends and individually purchased readings | Keep comparisons easy to reach; no account is currently needed to enter another person's chart. |
| [The Pattern](https://www.thepattern.com/) | Relationship views and a past/present/future transit exploration feature | Relationship and timing journeys deserve more depth, not a larger generic daily-text library. |
| [TimePassages](https://astrograph.com/astrology-software) | Transits, progressions, comparisons and a Moon-phase display | Lunar visual context is useful; progressions need their own specification and fixtures. |
| [Astrology.com](https://www.astrology.com/compatibility) | Separate love, work and other compatibility content | Preserve partner/friend/family context instead of assuming every comparison is romantic. |
| [Umbriel](https://umbrielastrology.com/calculators/annual-profections.html) | Profected house, sign, ruler and natal placement | Add an inspectable profection workflow with an explorable age cycle. |
| [Shymea](https://www.shymea.com/tools/annual-profection-calculator/) | Age-based whole-sign profections and a twelve-year table | Show the rule and birthday interval; distinguish the age-only result from time-dependent fields. |
| [Augurine](https://www.augurine.com/tools/mars-sign) | A dedicated Mars result with placement and motion details | Provide an actual Mars result and natal houses where supported. Do not claim all of its extra metrics. |
| [Natal Chart](https://natalchart.co/en/guides/chart-ruler/) | Traditional/modern ruler comparison with placement context | Show the convention, actual planet and house-system difference, not just a lookup label. |
| [Astrolium](https://astrolium.com/tools/profections-calculator) | Annual and smaller profection periods and multiple anchors | Scope our release to annual Ascendant-based profections; no unsupported sub-period claims. |
| [Merolot](https://merolot.com/en/profections) | Birth-date-based house-number calculation | Unknown times can still yield the age-based number while leaving sign/ruler unavailable. |
| [MoonCalc](https://www.mooncalc.org/) | Moon phase, location and astronomical event tools | Separate birth-phase illustration from local viewing orientation and rise/set calculations. |
| [timeanddate](https://www.timeanddate.com/news/astronomy/moon-october-2026) | Published UTC instants for October's four primary lunar phases | Use independent phase dates for regression tests; distinguish an instant from a “near” label window. |

## Prioritization

Priority below is a product judgment based on user relevance, existing capabilities, explainability and validation cost.
It is not a search-volume ranking.

| Opportunity | Decision | Reason |
| --- | --- | --- |
| Venus and Mars signs | Build now | Clear placement questions, relationship context, low additional calculation risk, useful onward links. |
| Birth Moon phase | Build now | Adds a distinct astronomical result and visual, with known/unknown-time treatment. |
| Chart ruler | Build now | Connects Rising to the actual natal planet and makes traditional/modern differences visible. |
| Annual profections | Build now | Adds interactive timing exploration with a transparent formula and bounded scope. |
| Synastry house overlays and a shared biwheel | Next product-depth candidate | Directly extends the user's partner/friend comparison goal; requires house-direction, unknown-time and polar fixtures. |
| Solar returns | Research and validate next | Needs an exact longitude-return solver, a clear location convention and independent timing checks. |
| Retrograde/transit calendar | Research and validate next | Needs reliable station boundaries, range selection and timezone presentation rather than a static date list. |
| Astrocartography | Later | Projection, angular-line calculations, relocation handling and map licensing need dedicated design and QA. |
| Secondary progressions | Later | Requires an explicit progression convention and reference results. |
| Approximate birth-time sensitivity | Next accuracy improvement | A bounded time interval would improve confidence more honestly than personality-based rectification claims. |
| Dominant-planet scores | Defer | Weighting conventions vary; a number would need an inspectable method and careful naming. |
| Moon-phase soulmate percentages | Do not add | Complementary images do not establish relationship suitability. |
| Vedic/sidereal tools | Separate future scope | Ayanamsha, interpretive conventions and references must be specified before making such a claim. |
| Numerology/tarot | Defer | Additional categories do not presently improve the core birth-chart task. |

## What shipped locally

| URL | Distinct result |
| --- | --- |
| `/calculators/venus-sign` | Venus sign, degree/day range, timed motion, supported houses and a reflection prompt. |
| `/calculators/mars-sign` | Mars sign, degree/day range, timed motion, supported houses and a reflection prompt. |
| `/calculators/moon-phase` | Geocentric illumination, schematic Moon, phase label, UTC evidence and hourly unknown-time samples. |
| `/calculators/chart-ruler` | Traditional and modern ruler(s), natal position and whole-sign/Placidus houses; no guessed Ascendant. |
| `/calculators/annual-profections` | Selected age, house, birthday interval, traditional time lord when available, and selectable twelve-year cycle. |

The directory supports search and category filters. Personal-chart and tool results include links that carry the
birth details in the URL fragment. Pages have unique titles, descriptions, canonical routes, public explanations,
FAQ content, source references, free WebApplication structured data and automatic sitemap inclusion. No per-keyword
duplicate pages were added. The extra calculations are on-screen tools; the existing PDF remains the birth-chart report.

## Calculation references and limits

- [NASA's Moon phases explanation](https://science.nasa.gov/moon/moon-phases/) separates changing illumination from
  the zodiac sign. The local illustration is schematic, not a horizon-orientation simulation.
- [Swiss Ephemeris programming documentation](https://www.astro.com/swisseph/swephprg.htm), planetary phenomena,
  documents the illuminated disc fraction used by the new endpoint. Unknown times use hourly samples and endpoints;
  displayed bounds are sampled, not exact extrema.
- [Astrodienst's rulership explanation](https://www.astro.com/astrology/in_ruler_e.htm) and
  [Astrotheme's chart-ruler discussion](https://www.astrotheme.com/chart-ruler-astrology.php) support the named
  Ascendant-ruler convention. A ruler lookup is not a dominant-planet ranking.
- [Annual profections in The Mountain Astrologer, hosted by Astrodienst](https://www.astro.com/astrology/tma_article190314_s.htm)
  describes advancing from the Rising sign by age and using its ruler. Our February 29 → February 28 calendar handling
  is an explicit product convention, not claimed to be universal.

## Validation and next evidence

Unit checks cover independently published lunar phases, equivalent UTC moments, 23/25-hour DST birth days, phase
boundaries, traditional versus modern rulership, birthday changes, leap days, invalid ages and missing times. The
existing reference-chart and SEO suites remain part of the release gate. Browser verification covers actual results,
mobile widths, search/filter reset, carried birth data, failure/retry and crawlable metadata.

Next evidence should come from a connected keyword provider and, after public launch, Search Console impressions and
queries plus real task-completion feedback. Record tool completion and understanding before adding more categories.
Do not present competitor marketing claims or the number of tools as proof of calculation or product superiority.
