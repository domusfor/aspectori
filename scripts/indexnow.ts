/**
 * Tells Bing (and other IndexNow engines) about the site's indexable pages.
 * Usage: npm run indexnow            -> submits the main, calculator, learn and zodiac sitemaps
 *        npm run indexnow -- --dry   -> prints the URLs without submitting
 * The famous-people chart pages are left out on purpose: they are many and thin.
 */
const SITE = "https://aspectori.com";
const KEY = "a267271b7127f2c30c73b0f1833fd14d"; // must match public/<KEY>.txt

// siteUrl is read at import time, so pin it before loading the sitemaps.
process.env.NEXT_PUBLIC_SITE_URL = SITE;

async function main() {
  const sitemaps = await Promise.all([
    import("../src/app/sitemap"),
    import("../src/app/calculators/sitemap"),
    import("../src/app/learn/sitemap"),
    import("../src/app/zodiac/sitemap"),
  ]);
  const urls = [...new Set(sitemaps.flatMap((m) => m.default().map((entry) => entry.url)))];
  const foreign = urls.filter((u) => !u.startsWith(`${SITE}/`) && u !== SITE);
  if (foreign.length) throw new Error(`URLs outside ${SITE}: ${foreign.slice(0, 3).join(", ")}`);

  if (process.argv.includes("--dry")) {
    console.log(urls.join("\n"));
    console.log(`${urls.length} URLs (dry run, nothing sent)`);
    return;
  }

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls }),
  });
  // 200 = accepted, 202 = accepted while the key is still being verified.
  if (res.status !== 200 && res.status !== 202) {
    throw new Error(`IndexNow returned ${res.status}: ${await res.text()}`);
  }
  console.log(`IndexNow accepted ${urls.length} URLs (HTTP ${res.status})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
