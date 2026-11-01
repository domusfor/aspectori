# Preproduction improvement: explain the chart — 30 October 2026

## Problem and change

A chart could calculate correctly while still leaving a newcomer unsure what to do with it. Some wheel selections
targeted readings inside a closed disclosure; the wheel also drew more aspects than the abbreviated reading listed.
Those selections could appear to do nothing.

The personal and famous-chart views now include **Make sense of your chart**, an interactive explanation panel:

- Start with Sun, Moon or Rising, or select another placement or aspect using a native, labelled control.
- Read what the selected point symbolizes, the calculated positions and house evidence, then the interpretation.
- Inspect the angular separation, exact aspect angle and allowed orb for a known-time aspect.
- Use a reflection question to compare the interpretation with lived experience.
- Change house systems in the panel; the wheel, explanation and existing reading update together.
- Open explanations of the diagram and of apparently conflicting themes within a chart.

Selecting a symbol, aspect line or linked phrase on the card now opens its explanation and moves keyboard focus to
the panel heading. The selector offers an alternative to tapping the small wheel glyphs. The abbreviated reading
remains available beneath the panel. Nothing is stored, and no additional request or account is required to explore.

This adds explanation and navigation, not a new astronomical model or a claim of interpretation accuracy. Existing
authored readings are reused and explicitly identified as traditional interpretations. New point definitions and
prompts do not assert that astrological meanings are measured personality facts.

## Uncertainty and consistency

- Unknown times retain endpoint positions and alternatives. Rising is unavailable, houses are absent, and the panel
  explains that matching endpoint signs do not prove a constant sign throughout the day.
- Unknown-time aspect explanations describe the sampled/inferred orb convention without presenting it as a continuous
  full-day bound or as an exact birth-time angular separation.
- Polar charts use whole-sign evidence with an explanation when Placidus is unavailable.
- Invalid or stale selections do not produce invented readings. The interface returns to the Sun if a previous
  selection cannot be resolved in the current chart.
- The new resolver is independent of the abbreviated reading list, so every plotted point/aspect can be explained.

## Verification

The full suite passes **205 tests in twelve files**. Six new regression tests cover all point/aspect references,
house-system evidence, unknown time, sign-boundary alternatives, polar fallback and invalid selections.
Production build, ESLint and TypeScript checks passed.

The reusable browser runner is `scripts/qa-chart-explorer.cjs`. It checks personal known-time, unknown-time and polar
fixtures, a famous profile, native selection, touch selection of Mercury, focus transfer, system synchronization,
all selector labels at 320/375/390/768/1440px, and automated accessibility in the three personal states. Browser
checks passed for **89 selectable explanations** across those three fixtures, with zero detected accessibility
violations, no clipped selector labels or page overflow at the five widths, and no recorded browser page errors.
The famous-chart Venus selection also passed. These are Chromium touch-emulation checks, not physical-phone or
screen-reader user testing.

Evidence: [browser results](qa/2026-10-30/explorer.json), [known-time mobile view](qa/2026-10-30/known.png),
[unknown-time mobile view](qa/2026-10-30/unknown.png), [polar mobile view](qa/2026-10-30/polar.png).

The visual pass also corrected subject–verb agreement in the shared house-reading sentence. The chart and reading
now stack below the desktop breakpoint; the former tablet columns left insufficient room for the explainer controls.

During verification, an incremental production build retained an older stylesheet. The old `.next` directory was
preserved in `/tmp`, and a fresh build was used for the final preview instead of trusting a successful cached build.

## Before public release

The next product gate is a first-time-user exercise using the actual preview. Ask people to:

1. Create their chart and explain the difference between Sun, Moon and Rising in their own words.
2. Find one planet and one aspect, then identify the calculated evidence separately from the interpretation.
3. Repeat with an unknown birth time and explain what is missing or uncertain.
4. Change house systems, compare two charts and save the free PDF on their own phone.

Record where they hesitate or misunderstand. Fix task failures before adding more calculators or claiming superiority
over competitors. Automated checks cannot establish comprehension or preference.

The earlier [quality audit](quality-audit-2026-10-27.md) still lists the production-domain, field-performance,
physical-device and operational checks. This change does not constitute deployment or close those release checks.
