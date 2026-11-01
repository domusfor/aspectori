#!/usr/bin/env node

const base = (process.argv[2] || "http://localhost:3143").replace(/\/$/, "");
const expectedOrigin = (process.env.SEO_EXPECTED_ORIGIN || "http://localhost:3000").replace(/\/$/, "");
const findings = [];
const add = (level, path, message) => findings.push({ level, path, message });
const between = (html, re) => (html.match(re)?.[1] ?? "").trim();

async function get(path, redirect = "manual") {
  const response = await fetch(base + path, {
    redirect,
    signal: AbortSignal.timeout(30_000),
    headers: { "user-agent": "Aspectori-Release-Audit/1.0" },
  });
  return { response, body: await response.text() };
}

function inspect(path, response, html) {
  if (response.status !== 200) return add("ERROR", path, `expected 200, got ${response.status}`);
  const title = between(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = between(html, /<meta name="description" content="([^"]*)"/i);
  const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]*)"/gi)].map((match) => match[1]);
  const h1s = [...html.matchAll(/<h1[\s>]/gi)].length;
  if (!title) add("ERROR", path, "missing title");
  if (!description) add("ERROR", path, "missing description");
  if (canonicals.length !== 1) add("ERROR", path, `expected one canonical, found ${canonicals.length}`);
  if (h1s !== 1) add("ERROR", path, `expected one h1, found ${h1s}`);
  const expectedCanonical = path === "/" ? expectedOrigin : expectedOrigin + path;
  if (canonicals[0] !== expectedCanonical) add("ERROR", path, `canonical mismatch: ${canonicals[0]}`);
  if (/<meta name="robots" content="[^"]*noindex/i.test(html)) add("ERROR", path, "indexable sitemap page is noindex");
  if (/NaN|\[object Object\]|>undefined</.test(html.replace(/<script(?![^>]*application\/ld\+json)[\s\S]*?<\/script>/gi, ""))) {
    add("ERROR", path, "invalid value in rendered content");
  }
  for (const match of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(match[1]);
      const encoded = JSON.stringify(data);
      if (/"@type":"(?:FAQPage|SearchAction)"/.test(encoded)) add("ERROR", path, "obsolete Google search markup is present");
    } catch (error) {
      add("ERROR", path, `invalid JSON-LD: ${error.message}`);
    }
  }
  const kb = Math.round(Buffer.byteLength(html) / 1024);
  if (kb > 900) add("ERROR", path, `HTML payload is ${kb} KB`);
  else if (kb > 400) add("WARN", path, `HTML payload is ${kb} KB`);
  if (title.length > 70) add("WARN", path, `title is ${title.length} characters`);
  if (description.length > 170) add("WARN", path, `description is ${description.length} characters`);
  return { title, description };
}

try {
  const { response: sitemapResponse, body: sitemap } = await get("/sitemap.xml");
  if (sitemapResponse.status !== 200) add("ERROR", "/sitemap.xml", `HTTP ${sitemapResponse.status}`);
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
  if (!urls.length) add("ERROR", "/sitemap.xml", "empty sitemap");
  if (urls.length !== new Set(urls.map((url) => url.href)).size) add("ERROR", "/sitemap.xml", "duplicate URLs");
  for (const url of urls) {
    if (url.origin !== expectedOrigin) add("ERROR", "/sitemap.xml", `wrong origin: ${url.href}`);
    if (url.search || url.hash) add("ERROR", "/sitemap.xml", `query or fragment: ${url.href}`);
  }
  if (urls.length > 50_000) add("ERROR", "/sitemap.xml", `${urls.length} URLs exceeds the single-sitemap limit`);

  const paths = urls.map((url) => url.pathname);
  const strategic = ["/", "/calculators", "/calculators/moon-sign", "/charts", "/charts/albert-einstein", "/zodiac", "/zodiac/aries", "/learn", "/birth-chart-report", "/accuracy", "/method", "/privacy"];
  const sampled = new Set([...strategic, ...paths.filter((_, index) => index % 137 === 0), paths.at(-1)].filter(Boolean));
  const titles = new Map();
  const descriptions = new Map();
  for (const path of sampled) {
    const { response, body } = await get(path);
    const metadata = inspect(path, response, body);
    if (!metadata) continue;
    if (titles.has(metadata.title)) add("ERROR", path, `duplicate sampled title also used by ${titles.get(metadata.title)}`);
    else titles.set(metadata.title, path);
    if (descriptions.has(metadata.description)) add("ERROR", path, `duplicate sampled description also used by ${descriptions.get(metadata.description)}`);
    else descriptions.set(metadata.description, path);
  }

  for (const path of ["/", "/charts", "/calculators/moon-sign"]) {
    const { body } = await get(`${path}?utm_source=release-audit`);
    const canonical = between(body, /<link rel="canonical" href="([^"]*)"/i);
    const expectedCanonical = path === "/" ? expectedOrigin : expectedOrigin + path;
    if (canonical !== expectedCanonical) add("ERROR", path, `tracking query changed canonical to ${canonical}`);
  }

  const { response: reportResponse, body: report } = await get("/report");
  if (reportResponse.status !== 200 || !/<meta name="robots" content="[^"]*noindex/i.test(report)) add("ERROR", "/report", "private report must return 200 with noindex");
  const { response: missing } = await get("/charts/not-a-real-person");
  if (missing.status !== 404) add("ERROR", "/charts/not-a-real-person", `expected 404, got ${missing.status}`);
  const { response: robotsResponse, body: robots } = await get("/robots.txt");
  if (robotsResponse.status !== 200 || !robots.includes(`Sitemap: ${expectedOrigin}/sitemap.xml`)) add("ERROR", "/robots.txt", "missing expected sitemap directive");
  if (/Disallow:\s*\/_next\//i.test(robots)) add("ERROR", "/robots.txt", "Next assets are blocked");

  const errors = findings.filter((finding) => finding.level === "ERROR");
  const warnings = findings.filter((finding) => finding.level === "WARN");
  console.log(JSON.stringify({ base, expectedOrigin, sitemapUrls: urls.length, sampledPages: sampled.size, errors, warnings }, null, 2));
  if (errors.length) process.exitCode = 1;
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
