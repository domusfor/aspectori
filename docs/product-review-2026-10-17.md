# Aspectori product review — 17 October 2026

The strongest part of the app is its calculation engine and traceable readings. This pass concentrates on making those strengths easy to discover and dependable to use. Existing source files and uncommitted work were preserved; no deployment or commit was made.

## Improvements implemented

| Area | Finding | Change |
| --- | --- | --- |
| Birth-time accuracy | A repeated local clock time could resolve to the second occurrence while its explanation claimed the first. | Explicitly select the earliest UTC occurrence; test with both winter and summer as the current date. |
| Input validation | Null/blank coordinates could become zero; malformed times, dates and chart links reached computation; valid time-zone aliases could be rejected. | Validate types, calendar dates, times, coordinate bounds, offsets and time zones consistently for API input and URL decoding. |
| Manual offsets | Inputs such as `+01:60` were accepted, and editing a historical chart could round its original offset. | Reject invalid minute components and retain the original fractional offset unless changed. |
| Search | Previous suggestions remained visible for a different query; loading, empty results and failures were unclear. | Share a debounced, cancellable search hook with query-specific results, status messages, retry actions and keyboard selection. |
| Request recovery | Year and comparison failures had no useful feedback; abandoned calculations continued on the client. | Cancel abandoned requests, show errors beside the affected feature, allow retries and use a request timeout. |
| Rate limits | Search calls consumed the same allowance as more restricted calculations. | Separate allowances by endpoint and cap the in-memory history. |
| Chart export | Image conversion errors were unhandled and the image library loaded with the page. | Load conversion code on demand, wait for fonts, prevent duplicate clicks and report failures. Add a copy-link action with a sharing explanation. |
| Mobile and keyboard use | Small-screen navigation was cramped and several controls lacked complete keyboard behavior. | Wrap mobile navigation, enlarge navigation targets, add a skip link and visible focus, and implement keyboard selection for house systems. |
| Homepage | The proposition was abstract, examples required discovery, and comparisons made broad unsupported claims. | Explain the benefit directly, offer an example chart and a mobile calculator shortcut, add a beginner guide and curate the featured chart selection. |
| Server rendering | Reveal animations and a streaming boundary made content dependent on JavaScript. | Render the homepage content before the interactive boundary, keep revealed content visible by default and explain the calculator’s JavaScript requirement. |
| Trust and metadata | The method page inherited the homepage canonical and claimed all famous charts were independently verified. | Add its own canonical and distinguish the reference charts from the larger date-only collection. Clarify how chart links contain birth details. |

## Verification

- Existing baseline: 88 passing tests, lint and TypeScript checks.
- Expanded suite: 128 passing tests across five files, including the existing Astro.com accuracy gate, input edge cases, repeated clock times and rate-limit isolation.
- Production build: verified after the changes, including prerendering 689 routes.
- Browser checks cover desktop, tablet, 320px and 375px layouts; city search and keyboard selection; real chart calculation; edit/cancel; house-system selection; clipboard copying; actual PNG export; year and comparison calculations; failure/retry paths; unknown-time charts; malformed links; famous-chart search; primary routes and real 404 responses.
- City results in the interaction suite are controlled fixtures so failure states and empty results are reproducible. Calculation endpoints use the actual engine. This is not a full cross-browser or accessibility certification.
- A separate live `/api/cities?q=Sofia` check returned real geocoder results. The final production browser run reported no uncaught browser exceptions and confirmed homepage content is visible with JavaScript disabled.

## Remaining product work

1. Verify the production domain and hosting configuration. Canonicals and sitemap URLs depend on `NEXT_PUBLIC_SITE_URL` or the Vercel production hostname. This review ran locally.
2. Resolve the existing launch items documented in the README: ephemeris/geocoder licensing and infrastructure-level rate limiting. The in-memory limiter remains per process.
3. Superseded on 18 October: the owner chose to make reports free. Direct PDF delivery is now enabled without payment or signup; see the [follow-up review](seo/strategy-2026-10-18.md). Any future paid offer still needs complete checkout and access controls.
4. Establish production measurements for mobile performance, calculator completion and failed city lookups without collecting birth details. No real-user performance or conversion data was available for this review.
5. Continue adding independently sourced accuracy fixtures, especially historical time-zone exceptions. The two documented 19th-century atlas differences remain; the manual offset option is still necessary.

These changes address observed defects and usability gaps. Market leadership would require user research, ongoing accuracy work and production evidence beyond this local review.
