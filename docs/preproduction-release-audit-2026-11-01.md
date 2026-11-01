# Aspectori preproduction release audit — 2026-11-01

## Decision

The application code and local production build pass the automated preproduction checks. Production release remains gated on real operator, licensing, provider, domain, verification, and edge-rate-limit configuration. Those values must not be guessed.

## Verified build

- Next.js 16.4.2 production build: passed with Turbopack
- Generated static and partially prerendered pages: 805
- Unit tests: 205 passed across 12 files
- ESLint: passed
- TypeScript: passed
- Production dependency audit: 0 known vulnerabilities
- Security response headers: CSP, HSTS, `nosniff`, `SAMEORIGIN`, strict referrer policy, and restricted browser permissions present

## Chrome and mobile audit

The production server was tested in Chromium across 27 representative states, including the home calculator, all calculator types, learning pages, chart explorer, famous chart, category, zodiac, accuracy, method, privacy, populated comparison, and report views.

- Viewport widths: 320, 375, 390, 768, and 1440 pixels
- HTTP failures: 0
- axe WCAG 2.0/2.1/2.2 AA and best-practice violations: 0
- Horizontal overflow cases: 0
- Clipped select labels: 0
- Browser console and page errors: 0

The audit artifact is written to `/tmp/aspectori-quality/audit.json`, with screenshots in the same directory.

## SEO audit

- Sitemap URLs: 8,705 unique URLs
- Strategic and interval sample: 76 pages
- Errors: 0
- Warnings: 0
- Every sampled indexable page has one title, description, H1, and canonical
- Tracking query strings do not alter canonicals
- Private report route is `noindex, nofollow`
- Invalid chart slugs return 404
- JSON-LD parses successfully
- Obsolete `FAQPage` and `SearchAction` markup is absent
- `robots.txt` exposes the sitemap and does not block Next.js assets

## Release configuration still required

`npm run release:check` intentionally blocks a release until these real production facts are configured:

1. Final HTTPS domain and Google/Bing ownership tokens
2. Data controller name, privacy email, legal basis, hosting provider, geocoder provider, log retention, and international-transfer wording
3. Swiss Ephemeris commercial license, or the AGPL path with a public corresponding-source URL
4. A commercially licensed or self-hosted geocoder endpoint
5. A tested production edge/firewall rate limit for `/api/*`

The required environment keys and provider notes are in `.env.example`. The gate is implemented in `scripts/validate-release.mjs`.

## Practical limit

Automated checks cannot certify legal compliance, real-device behavior across every browser, search ranking, or field Core Web Vitals before public traffic exists. The release gate ensures that these remaining external facts are resolved explicitly instead of being hidden by placeholder values.
