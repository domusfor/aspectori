# Feature research — 27 October 2026

## Decision

Improve the existing task journeys before adding another calculator category. Aspectori now offers ten calculators,
personal weekly readings, famous suggestions, comparisons with house overlays and free PDFs. Its useful positioning
is inspectable calculations and honest limits. Those strengths need understandable explanations, reliable mobile input
and recovery when a service fails. Tool count and a free PDF do not establish market leadership.

This is a 24-product review of first-party public descriptions, not a paid-product benchmark. A documented feature is
an advertised capability unless explicitly tested locally in Aspectori. A feature omitted from a competitor's page is
unverified, not absent. No competitor accuracy, conversion, traffic or ranking superiority was independently measured.
Prices are deliberately excluded because product tiers, platforms and promotions are not directly comparable.

## Competitor evidence

| Product and source | Advertised capability observed | Implication for Aspectori |
| --- | --- | --- |
| [Astrodienst](https://www.astro.com/horoscopes) | Multiple chart types, ephemerides, relationship and timing products. | Breadth and a reference ecosystem exceed our current scope. Keep calculation conventions explicit. |
| [Astro-Seek](https://www.astro-seek.com/) | Indexed directory describes returns, progressions, chart comparison, search and calendars. Direct access returned 403; the retrieved home index was dated 2025. | Inventory lead only; do not claim current feature parity from that stale result. |
| [Cafe Astrology](https://cafeastrology.com/free-natal-chart-report.html) | Free natal positions, house-system comparisons and authored interpretations. | Interpretation depth and author accountability matter; free calculations are established expectations. |
| [Astrotheme](https://www.astrotheme.com/celebrities/search_by_astrological_criteria.php) | Celebrity discovery by astrological criteria. | Placement filters and birth-time quality filters would improve our existing catalogue. |
| [Astro Charts](https://www.astro-charts.com/) | Natal, synastry, composite and transit tools, plus a longer report. | A combined comparison wheel and clearer report navigation are plausible depth improvements. |
| [CHANI](https://www.chani.com/app) | Chart interpretation, weekly material and transit-oriented content. | Repeat visits require useful dated context and editorial care, not generic daily text. |
| [Co–Star](https://www.costarastrology.com/faq/) | Account-based friends, compatibility and daily updates. | Preserve our low-friction comparison flow; accounts need a demonstrated user benefit. |
| [The Pattern](https://www.thepattern.com/app-features) | Indexed first-party description covers personal patterns, relationships and transits. Direct open was inaccessible. | Plain-language navigation is relevant; published claims do not verify interpretation accuracy. |
| [TimePassages](https://astrograph.com/astrology-software) | Mobile and desktop chart interpretation and transit tools; desktop feature list includes a timeline and adjustable orbs. | Separate mobile from desktop benchmarks; advanced controls need their own validation. |
| [Astro Gold](https://www.astrogold.io/get-astro-gold/for-ios/) | Mobile chart calculation, interpretation and display customization. | Native-app breadth is a separate benchmark; phone usability must work before pursuing it. |
| [Astro Future](https://www.astro-future.com/) | Animated charts, transit exploration and relationship views. | Date exploration is a stronger prospective interaction than adding static generic text. |
| [AstroMatrix](https://astromatrix.org/Tools/birth-chart) | A larger object inventory, declinations and interpretive systems. | Additional objects increase explanatory and validation work; do not add them merely for a count. |
| [AstroSage](https://www.astrosage.com/free/) | Vedic-oriented software and reports. | This is a different calculation tradition; our tropical tools must not target Kundli promises. |
| [Astrology.com](https://www.astrology.com/birth-chart) | Birth-chart entry and beginner explanations. | Easy onboarding is essential. Their noon suggestion is not our uncertainty convention. |
| [AstroStyle](https://astrostyle.com/birthchart/) | Free birth-chart entry linked to an editorial brand. | Brand trust and educational continuity matter alongside the form. |
| [AstroLibrary](https://astrolibrary.org/report/) | Synastry reports with or without known birth times and additional points. | Unknown-time support is not unique; explain exactly what our samples establish. |
| [Umbriel](https://umbrielastrology.com/calculators/synastry.html) | Aspects, house overlays and a biwheel, with a scoring feature. | Biwheel visualization is a gap. A numerical relationship score is not a requirement to copy. |
| [Augurine](https://www.augurine.com/tools/synastry-aspect-grid-calculator) | An inter-aspect matrix with orbs; other reviewed pages describe house systems and returns. | A keyboard-usable aspect matrix could complement the current reading cards. |
| [Shymea](https://www.shymea.com/compare/whole-sign-vs-placidus/) | Interactive house-system comparison; reviewed tools also cover profections and chart rulers. | Our side-by-side comparisons are competitive baseline features, not unique inventions. |
| [Pastrologer](https://pastrologer.com/) | Free natal output and PDF, explicit place/offset inputs. | Compare workflow clarity and export quality, not only whether a PDF exists. |
| [NatalChart.AI](https://www.natalchart.ai/birth-chart-calculator) | Free chart output, explicit Placidus scope and uncertainty notes. | A declared boundary can be a strength; avoid implying every system is supported. |
| [Astrolium](https://astrolium.com/tools/profections-calculator) | Annual and smaller profection periods. | Annual profections remain our bounded scope; smaller periods need separate conventions. |
| [Astrologican](https://astrologican.com/tools/birth-time-range/) | Birth-time range exploration. | Approximate-time sensitivity is a useful next accuracy feature, distinct from finding a supposed true time. |
| [TransitCalendar](https://www.transitcalendar.com/personal) | Personal transit-calendar products. | A full calendar with date and timezone controls differs from our selected weekly/yearly contacts. |

## Capability and next-work matrix

Priority is a product judgment based on observed gaps and implementation risk, not measured keyword volume.

| Capability | Current Aspectori state | Decision / acceptance evidence |
| --- | --- | --- |
| Birth entry on small screens | Month text clipped at narrow form widths; fixed in this audit | P0: all month names readable, native selects, touch and keyboard completion. |
| Keyboard access to wide tables | Three audited contexts flagged; focusable named regions added | P0: keyboard scroll and visible focus, without page-wide overflow. |
| Readable report text | Gold/muted small-text contrast failed; colors corrected | P0: automated contrast checks plus visual review. |
| Honest unknown-time language | Some copy overstated endpoint evidence; corrected | P0: wording agrees across results, methodology, FAQ and report. |
| Sky loading failure | Previously could leave a spinner indefinitely; timeout/retry added | P0: forced failure, retry, accurate timestamp and cache explanation. |
| Responsive comparison wheels | Two tiny wheels on phones; stacked and enlarged | P0: readable small-screen layout; both directions retained. |
| Natal accuracy | Published 22-chart reference set, historical exceptions documented | Maintain fixture gate; expand independent samples before claiming wider validation. |
| Full no-time uncertainty bounds | Endpoint checks only for natal signs/aspects | P1: investigate continuous extrema/stations; avoid claiming endpoints prove the whole day. |
| Approximate birth-time interval | No interval tool | P1: interval sampling, wrap/station cases, DST ambiguity and independent references. |
| Synastry biwheel | Two individual wheels plus overlay tables | P1: prototype inner/outer ownership, house-system controls and a readable table equivalent. |
| Inter-aspect matrix | Filterable contact cards, no matrix | P1: keyboard-accessible grid, visible orbs, no implied compatibility percentage. |
| Overlay interpretations | Numerical house assignments with evidence | P1: concise authored interpretations and prompts, independent editorial review. |
| Famous-chart filters | Name search, category and zodiac paths | P1: placement and source-quality filters; preserve uncertain Moon/Rising distinctions. |
| Chart glossary / worked example | Four guides and method page | P1: annotated original example, jargon explanations adjacent to the result. |
| Chart saving | URL fragment, copy/share controls | P1 research: test comprehension; an explicit device-only save feature needs delete/export behavior. |
| Manual coordinates | No user-facing alternative to city search | P1 research: useful for missing places, but requires timezone validation and understandable defaults. |
| Repeated local time selection | Earliest occurrence plus manual UTC override | P1: explicit occurrence selector with tested DST fixtures and clear explanation. |
| Solar returns | Not implemented | P2: exact longitude solver, location choice, timezone and independent timing fixtures first. |
| Saturn returns | Selected annual transits are not a return tool | P2: all passes, date windows, no-time uncertainty and precision checks. |
| Full transit calendar | Weekly themes and selected annual contacts only | P2: date navigation, clear selection rules, local timezone and boundary tests. |
| Calendar export | Not implemented | P2: label sampled contacts correctly; do not export them as exact events. |
| More house systems | Placidus/whole sign, Porphyry reference | P2: only after evidence of use; reference fixtures and polar conventions required. |
| Composite / Davison | Not implemented | P2: separate techniques, conventions and reference charts; no placeholder landing pages. |
| Secondary progressions | Not implemented | P2: define progression and angle convention before coding. |
| Astrocartography | Not implemented | Later: independent map, projection, angular-line and licensing project. |
| Sidereal / Vedic | Not implemented | Separate product scope; ayanamsha and traditions must be specified. |
| Dominant planet / stellium scores | No weighting engine | Defer; conventions need inspection and genuine user demand. |
| Moon-phase soulmate percentage | Not implemented | Do not add a relationship-validity claim from two Moon images. |
| Offline app / notifications | Not implemented | Validate return use first; never cache personal API responses accidentally. |
| Multilingual product | English | Validate geography and localization resources before adding hreflang or translated pages. |
| Tagged accessible PDF | Selectable text exists; PDF tagging not established | Requires a dedicated document-accessibility review; visual checks do not certify it. |
| Independent editorial review | No qualified external review confirmed | Real reviewer, provenance and corrections; never invent credentials. |

## Sequence

1. Finish the current mobile and quality acceptance checks and confirm public hosting settings.
2. Validate the 58-term shortlist and collect task-completion feedback on the current ten tools.
3. Choose one depth project: approximate birth-time sensitivity or comparison visualization. Validate its mathematics
   and usability before adding public landing pages.
4. Reassess return/calendar scope from actual demand. Leave separate traditions and map products outside this release.

Evidence index: [46 logged searches and direct-open outcomes](search-evidence-2026-10-27.json).
