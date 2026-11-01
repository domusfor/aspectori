# Personalized week ahead — 20 October 2026

The personal chart now automatically requests a free weekly reading from `POST /api/week`.
Open the local production preview at `http://localhost:3143`, enter birth details, and find
**Your week ahead** immediately below the personal chart introduction. The chart navigation
also includes **Week**. Famous matches, personal comparisons and free PDF reports remain available.

## Behavior

- Up to three themes selected from actual transits, with planet-specific symbolic interpretations,
  reflection questions, a seven-day contact strip and expandable calculation evidence.
- The server chooses today through six days ahead in UTC. Samples occur at 00:00, 06:00, 12:00 and
  18:00 UTC. Major aspects must be within 1°. A marked date means at least one sample qualified;
  neither marked dates nor the closest sample are presented as exact passage times.
- Nine transiting bodies: Sun, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto.
  Natal targets: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rising and Midheaven.
- Missing birth times omit Moon/Rising/Midheaven targets and require other contacts to qualify
  at both birth-day endpoints. Displayed orb bounds describe those measured endpoints only.
- Closest sampled orb determines the ordering, initially favoring different topic categories.
  There is no impact score, certainty rating, event prediction or invented theme for empty results.
- Opening a saved chart calculates the current window. Manual refresh and the open tab's UTC date
  change trigger recalculation. The client date is a refresh trigger, not an API date override.
- Weekly request failures leave the rest of the chart usable. Retry is available inline.
- Personalized responses use `Cache-Control: no-store`; no account, payment, database or tracking
  integration was added. The weekly interpretation is currently on the chart page, not in the PDF.
- The homepage feature copy and FAQ, including its structured data, now describe the weekly reading.
  `/method#week` documents selection, sampling and uncertainty.

An existing full-chart anchor was changed to a scroll button: replacing the URL fragment with
`#your-chart` previously removed the birth details. Navigation now preserves the saved chart URL.

## Verification

- `npm test`: **158 tests passed across 8 files**, including 13 new weekly tests.
- Tests independently reproduce published positions and orbs through the sky and natal calculators,
  validate every published contact date, and cover missing times, malformed API requests, no-store,
  deterministic results, personalization, UTC offsets, year boundaries and leap days.
- `npm run lint`, `npm run typecheck` and the production build passed.
- Browser QA against the production preview checked widths 320, 375, 768 and 1440 without horizontal
  overflow; calculation disclosure; matching contact markers; refresh; midnight rollover; failure/retry;
  empty results; missing times; retained famous suggestions; preserved birth fragments; public methodology
  and server-rendered FAQ. No page errors were recorded.
- Desktop and mobile screenshots were visually inspected. QA runner: `/tmp/aspectori-week-qa.cjs`;
  screenshots: `/tmp/aspectori-week-desktop.png`, `/tmp/aspectori-week-mobile.png`.

Changes are in the local workspace and local production preview. No commit or public deployment was made.
