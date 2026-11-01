# Connections and the personal atlas — 18 October 2026

After someone creates a birth chart, the result now immediately offers two paths: automatic famous-chart suggestions, or a comparison with someone in their own life. Their own birth details carry through both paths. PDF reports have been redesigned and remain free.

## Automatic famous suggestions

`POST /api/matches` compares the user's Sun, Moon and Rising signs with the cached 8,434-profile collection and returns six suggestions. The ranking prioritizes the number of definite shared placements, then possible overlaps, then the collection's existing popularity ordering. Stable slug ordering resolves ties.

Each card states the shared placements, whether an overlap is only possible, the person's field, and the available birth-time rating. Unknown-time charts never receive an invented Rising sign. These are sign similarities, not exact-degree twins, personality equivalence or romantic compatibility scores. Selecting a person preserves the user's own birth input and opens the full comparison. Profile links expose the source information.

The new response handler awaits asynchronous calculations and preserves `Cache-Control: no-store`. Public famous summaries can be cached; personal input and matching responses are not stored. The endpoint uses the existing input validation, body-size limit and per-instance rate limiting.

## People in the user's life

The second path accepts a partner, friend, family member or another connection. It provides an optional name/label and keeps the existing date, time, unknown-time and city controls. The name is limited to 40 characters. Relationship context adjusts reflection questions; it does not alter planetary calculations.

The comparison has two individual chart wheels, the full contact count, and filters for communication, emotional rhythms, connection/energy and support/growth. Each retained contact includes a planet-specific explanation where available, the traditional aspect interpretation, positions, the orb and a question to explore. The interpretation fallback describes the actual two planetary themes rather than inventing a bespoke prediction.

Unknown-time limitations are prominent. No contact count or aspect category is presented as a relationship score. The wheels are individual whole-sign charts, not a biwheel with house overlays or a composite chart. The broader technique is described in [Astrodienst's synastry introduction](https://www.astro.com/astrowiki/en/Synastry); the exact selection and orb rules remain specific to this application.

Names and birth details are held in the shareable URL fragment. No database, account system or tracking was added. A person can be edited, the relationship context can be changed, and reloading a chart link restores the selected comparison. Direct links from famous profiles now explicitly carry the famous-person context.

## Redesigned free PDF

The report now has a navy/gold cover, embedded serif and sans-serif typography, and a cream interior with deliberate section layouts:

- Sun, Moon and Rising overview cards.
- Element-count graphics based equally on the ten planets; uncertain sign placements are excluded and stated. These are not personality percentages.
- Planetary table with signs, degrees, both house systems and highlighted differences.
- Reading cards with their calculation evidence and reflection prompts.
- Full major-aspect list and selected transit windows.
- Optional comparison appendix with every retained contact, evidence and relationship-context questions.
- A glossary, calculation record, limitations and clickable reference links.
- PDF section bookmarks, page numbers and selectable text.

The comparison edition names the selected person on a “Your skies, together” cover. Font assets load when the user exports; Noto Sans regular/bold and Noto Serif use the bundled SIL OFL license. The report is generated on the user's device after the chart calculations return. It is not claimed to be a tagged PDF/UA document.

The on-screen report and public PDF landing page have also been restyled. A failed year calculation allows a natal report with an explicit missing-year note. A failed comparison clearly changes the available action to “Download natal PDF only” and offers a retry; it does not silently claim to include the missing comparison.

## Verification

- **145 tests in seven files pass**, including the existing reference accuracy gate. New tests cover matching order and uncertainty, bounded suggestions, element-count integrity, contextual reading prompts, comparison report completeness, and asynchronous response/error handling.
- TypeScript, lint and the production build pass. The build prerenders 797 routes; existing on-demand chart URLs remain available.
- Chromium checks cover six automatic suggestions, one-click famous comparison with the original birth input preserved, topic filtering, entering a friend through the form, reloading the saved comparison, editing to partner/unknown-time context, and suggestion failure/retry.
- The synthetic friend fixture produced 17 contacts. Calculation endpoints were real; the city search used a controlled Sofia response for reproducible form selection.
- Page-overflow checks cover 320, 375, 768 and desktop widths. No uncaught browser errors were observed in the completed audits.
- Actual natal, comparison and unknown-time PDFs were downloaded. The unknown-time mobile case deliberately failed the year endpoint. A separate comparison outage check verified explicit natal-only labeling and recovery.
- PDF text, page boundaries, embedded chart images and bookmarks were inspected with PyMuPDF. Representative cover, overview, reading and comparison pages were visually reviewed.

The synthetic examples have 19 natal pages, 28 pages with the comparison appendix, and 15 unknown-time pages with unavailable year data. Page count varies with the chart and input uncertainty; these are not promised report lengths. Review copies are in `docs/previews/` and contain synthetic test birth details, not the user's information.

This is a local product update, not a public deployment. Independent editorial review, broader user research, field performance measurement and the previously documented deployment/tooling work remain necessary before claiming market leadership. No claim of “best in the world” is established by these checks.
