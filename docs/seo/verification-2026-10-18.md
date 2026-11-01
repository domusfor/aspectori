# Verification — 18 October 2026

## Automated checks

- `npm test`: **137 passing tests in six files**, including the existing 22-chart reference accuracy gate.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: production build passed, prerendering 796 routes. Many additional famous-profile URLs are generated on demand; the sitemap contains **8,699 unique URLs**, not merely the prerendered subset.
- Added report-content tests for unknown time, selected houses, fractional historical UTC offsets, missing year data, full aspect coverage and polar fallback.
- Added synastry tests for full retained contacts, unchanged top-three highlights and omitted unknown-time angles.
- Added full-category count/pagination coverage checks, sitemap uniqueness and tool/guide linking checks, and a regression test for the first-page redirect and invalid dynamic URLs.

## Production browser checks

Chromium/Playwright against `http://localhost:3143`, using the real calculation endpoints and deterministic synthetic birth inputs:

- Five calculator modes return results; the synastry fixture displays 20 qualifying contacts.
- Unknown-time Moon returns Taurus or Gemini with the local change time; Rising is not invented.
- House-system selection carries into the report URL and content.
- Layout checks at 320, 375, 768 and desktop widths; no page-level horizontal overflow in sampled tools, hubs, guide, report landing, category pagination and report.
- New public pages have the expected canonical paths. Unknown tools, guides, categories and out-of-range/noncanonical page numbers return 404.
- `/charts/category/film/page/1` returns an HTTP 308 to the base category. The initial streamed 200 was found during QA and fixed in the proxy.
- Sitemap URLs are unique and include category pagination. Private `/report` is absent, carries `noindex`, and is not blocked by robots.txt.
- Famous-chart report link works, and recorded-time Moon copy uses source-qualified wording.
- Guide and calculator explanations remain available with JavaScript disabled.
- No uncaught browser exceptions in the completed audit.

This is a Chromium smoke audit, not certification across all browsers, screen readers or devices. It does not measure production Core Web Vitals or organic rankings. Canonical hostnames use the configured deployment environment; the local fallback is not a verified public domain.

## Actual PDF checks

The browser downloaded real files, not screenshots of a disabled button:

- Known time, whole-sign reading, selected transits: **7 pages**.
- Unknown time with an intentionally failed year API: **5 pages**, with the natal reading available and the missing year explicitly stated.
- The same unknown-time case downloaded from a **375px viewport**: **5 pages**.

PyMuPDF extracted selectable text from all pages and checked content bounds, nonempty pages, expected headings, preserved house selection, unknown-time ambiguity, and missing-year wording. Cover images were present. Rendered covers and representative content pages were inspected visually.

Visual QA found an export-clone margin shifting the wheel outside its canvas; the PDF export now resets the clone margin. The chart viewport also has padding for outer angle labels. Browser QA checks that every wheel text element fits inside its SVG viewport. The PDF uses an embedded Noto Sans font with its bundled SIL OFL license. It is not claimed to be a tagged PDF/UA document.

Temporary audit artifacts are `/tmp/aspectori-free-report.pdf`, `/tmp/aspectori-unknown-report.pdf`, `/tmp/aspectori-mobile-report.pdf` and `/tmp/aspectori-*-pdf-page-*.png`. They contain synthetic test birth data. The browser audit script is `/tmp/aspectori-seo-qa.cjs`; it uses the Playwright installation available in this workstation, not a newly added project dependency.

## Dependency findings and remaining limits

`npm audit --omit=dev` reported **zero known production dependency vulnerabilities** at the time checked. This is an advisory-database result, not a security guarantee.

The full dependency audit still reports **eight development-tool findings**: five high, two critical and one moderate, in the lint/test dependency chains. The proposed automatic remediations include a major Vitest migration and a Next ESLint configuration downgrade. They were not forced into this SEO/report change. The workstation runs Node 20.11.1 and also emits a newer engine requirement for part of the lint tooling; review the Node/test-tool upgrade together rather than silently accepting an incompatible migration. See `/tmp/aspectori-audit.json` for the captured audit.

No public deployment, search-engine submission, account connection, payment integration, analytics collection or outbound marketing was performed. Search-volume and organic-difficulty data are not available; the research explicitly labels candidate phrases and assumptions. Existing historical time-zone exceptions, deployment licensing decisions, infrastructure rate limiting and independent editorial review remain documented follow-up work.
