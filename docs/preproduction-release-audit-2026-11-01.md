# Aspectori preproduction release audit — 2026-11-01

## Decision

The application code and local production build pass the automated preproduction checks. Production release remains gated on real operator, licensing, provider, domain, verification, and edge-rate-limit configuration. Those values must not be guessed.

## Verified build

- Next.js 16.4.2 production build: passed with Turbopack
- Generated static and partially prerendered pages: 408 after the deployment build optimization
- Unit tests: 205 passed across 12 files
- ESLint: passed
- TypeScript: passed
- Production dependency audit: 0 known vulnerabilities
- Security response headers: CSP, HSTS, `nosniff`, `SAMEORIGIN`, strict referrer policy, and restricted browser permissions present

## Chrome and mobile audit

The production server was tested in Chromium across 30 representative states, including the home calculator, all calculator types, learning pages, chart explorer, famous chart, category, zodiac, accuracy, method, about, contact, privacy, terms, populated comparison, and report views.

- Viewport widths: 320, 375, 390, 768, and 1440 pixels
- HTTP failures: 0
- axe WCAG 2.0/2.1/2.2 AA and best-practice violations: 0
- Horizontal overflow cases: 0
- Clipped select labels: 0
- Browser console and page errors: 0

The audit artifact is written to `/tmp/aspectori-quality/audit.json`, with screenshots in the same directory.

## SEO audit

- Sitemap URLs: 8,708 unique URLs
- Strategic and interval sample: 78 pages
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

1. The real controller identity and completed privacy configuration. The public alias is `privacy@aspectori.com`; it must be backed by a working mailbox or forwarder before launch so the personal address stays private.
2. The signed Swiss Ephemeris Professional license. The repository is private, so the AGPL release path is not selected. `SWISS_EPHEMERIS_COMMERCIAL_LICENSE_CONFIRMED=true` may be set only after the license is in force.
3. An Open-Meteo commercial subscription and customer geocoding endpoint/API key, or a licensed self-hosted alternative. The paid Open-Meteo route is selected because it preserves the existing response contract and keeps browser requests behind Aspectori.
4. A successful gated production deployment, assignment of `aspectori.com` and `www.aspectori.com`, and the DNS records that Vercel reports for this project.

Google and Bing ownership tokens are launch follow-ups rather than release blockers. The sitemap can be submitted as soon as the public domain is serving the successful production deployment.

## Completed Vercel controls

- The project is on Vercel Pro. The production privacy setting reflects Vercel's documented one-day runtime-log retention for that plan.
- The active `rate-limit-production-api` firewall rule matches production paths starting with `/api/` and permits 60 requests per 60-second fixed window per IP before returning the rate-limit response. The published API response reports the rule as active and valid with no validation errors.
- `NEXT_PUBLIC_SITE_URL=https://aspectori.com`, the verified Vercel provider and transfer wording, the selected commercial-license path, and the firewall confirmation are configured for Production. The commercial-license confirmation remains explicitly false until the signed license is in force.

The required environment keys and provider notes are in `.env.example`. The gate is implemented in `scripts/validate-release.mjs`.

## Practical limit

Automated checks cannot certify legal compliance, real-device behavior across every browser, search ranking, or field Core Web Vitals before public traffic exists. The release gate ensures that these remaining external facts are resolved explicitly instead of being hidden by placeholder values.
