# Symbols, circles and animation review — 28 October 2026

The checked wheel geometry and symbol mappings are consistent with the application's zodiac-longitude model.
This review found and corrected crowded-label spacing and incomplete reduced-motion handling. It does not certify
every browser font, phone or possible birth chart.

## Meaning of the visuals

- The twelve sign glyphs follow Aries through Pisces. Planet, North Node and Chiron glyphs use the conventional
  Unicode characters. Reference: [Unicode Miscellaneous Symbols](https://www.unicode.org/charts/PDF/U2600.pdf).
  Actual glyph shapes depend on the platform's symbol fonts; physical iOS/Android font checks remain outstanding.
- The concentric rings separate signs, ticks, labels, houses and aspect lines. They are diagram guides, not physical
  planetary orbits or distance scales. Each sign spans 30 degrees; tick marks occur every five degrees.
- Known-time charts place the Ascendant at the left. Planet ticks preserve the calculated longitude; crowded labels
  can move around the label ring and now have leaders connecting them to their ticks.
- Whole-sign and Placidus house boundaries are distinct. The main chart and report already explicitly select whole
  sign when Placidus is unavailable; the standalone Wheel no longer silently substitutes a different system.
  Unknown-time wheels omit houses and angles. Unknown-time planetary ticks use endpoint midpoints, with visible
  arcs for sufficiently large endpoint differences; these are not exact birth positions or continuous day bounds.
- Aspect lines are deliberately a selected subset (at most eight, excluding slow–slow pairs and MC contacts), not all
  mathematical relationships. Colors distinguish the featured/selected contact and the application's aspect groups;
  dashed lines identify trines/sextiles. This styling does not validate astrological interpretations scientifically.
- The Moon drawing correctly represents the supplied illuminated fraction. Waxing is lit on the right and waning on
  the left in its schematic northern-hemisphere convention. It is not a location-aware view of the Moon's sky tilt;
  the current-sky percentage is a rounded approximation from Sun–Moon longitude separation.
- The large background wheel rotates once every ten minutes for decoration. The horizon, glints and background stars
  are artwork. Their movement does not simulate observed orbital motion or a local horizon.

The underlying positions and house inputs come from the existing ephemeris implementation; this change does not
alter astronomical calculations. [Swiss Ephemeris reference](https://www.astro.com/swisseph/swephprg.htm).

## Corrections

1. Replaced the eight-pass modulo label adjustment with circular spacing that preserves zodiac order, including
   exact conjunctions and clusters crossing 0 degrees. Added leaders for displaced labels without moving true ticks.
2. Removed animation/transition delays under reduced motion. Existing short-duration rules alone had left staged
   glyphs waiting before appearing.
3. Scroll-triggered reveals now stop if reduced motion is enabled while the page is open. Chart links and navigation
   respect that preference instead of always requesting smooth scrolling.
4. Removed the internal house-system substitution from Wheel as a defensive consistency change. The main chart/report
   fallback was already handled and explained upstream; this was not an observed mislabeled chart in those flows.
5. Added an SVG description explaining the diagram, label displacement and endpoint sampling.

## Verification

- **199 tests across eleven files passed**, including five new spacing tests. One test checks 1,000 deterministic
  crowded layouts; others cover twelve identical longitudes, the 0-degree boundary and unchanged separated labels.
- Production build, TypeScript, ESLint and whitespace checks passed.
- Chromium at 375px: known-time, unknown-time and polar fixtures checked for twelve sign labels, twelve body glyphs,
  nonoverlapping glyph boxes, precise tick coordinates, house counts and angle visibility. Normal/polar Ascendant
  labels were at the left. Polar Placidus was unavailable and the user-facing explanation was present.
- Ten Moon drawings (0/25/50/75/100% × waxing/waning) checked by sampling the actual SVG fill: area matched the supplied
  fraction within one percentage point and the illuminated side matched the convention.
- Normal decorative rotation and live changes to reduced-motion preference checked in the browser. Reduced-motion
  animation delays were zero and the repeating rotation became a single negligible-duration iteration.
- No browser page errors recorded. Screenshots inspected for known, unknown-time and polar wheels.

Evidence: [browser audit JSON](qa/2026-10-28/wheel.json). Reproduce with the production preview on port 3143:
`PLAYWRIGHT_MODULE=/path/to/playwright node scripts/qa-wheel.cjs`.

The automated checks cover diagram correctness and the tested rendering, not all possible glyph fonts, screen-reader
experiences, real-device animation smoothness or astronomical uncertainty outside the existing calculation model.
