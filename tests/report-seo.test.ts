import { describe, expect, it } from "vitest";
import { computeChart, computeCouple } from "@/lib/astro/engine";
import { buildReport, reportHref, REPORT_OFFER } from "@/lib/report";
import { decodeBirth } from "@/lib/url";
import { ALL_FAMOUS, CATEGORIES, FAMOUS_INDEX_LIMIT, INDEXABLE_FAMOUS, isFamousIndexable } from "@/data/people";
import { CATEGORY_COUNTS, CATEGORY_PAGE_SIZE, categoryHref, categoryPages } from "@/lib/category-pages";
import { CALCULATORS } from "@/data/calculators";
import { GUIDES } from "@/data/guides";
import sitemap from "@/app/sitemap";
import chartsSitemap from "@/app/charts/sitemap";
import robots from "@/app/robots";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

const birth = { date: "1990-08-14", time: "14:30", place: { label: "Sofia, Bulgaria", lat: 42.6975, lon: 23.3241, tz: "Europe/Sofia" } };

describe("free PDF content", () => {
  it("keeps selected houses and fractional historical offsets in the private fragment", () => {
    const chart = computeChart({ ...birth, offset: 123.5 });
    const href = reportHref(chart, "whole");
    expect(href.split("#")[0]).toBe("/report");
    const params = new URLSearchParams(href.split("#")[1]);
    expect(params.get("hs")).toBe("whole");
    expect(decodeBirth(params.get("b"))).toEqual(chart.input);
    expect(REPORT_OFFER.price).toBe(0);
    expect(buildReport(chart, null, "whole").sections[0].paragraphs.join(" ")).toContain("Reading uses whole sign houses");
  });
  it("includes every natal aspect and explicitly handles unavailable year data", () => {
    const chart = computeChart(birth);
    const report = buildReport(chart, null, "placidus");
    expect(report.sections.find((s) => s.title === "Major aspects and their orbs")!.paragraphs).toHaveLength(chart.aspects.length);
    expect(report.sections.find((s) => s.title === "The next twelve months")!.paragraphs.join(" ")).toContain("unavailable");
  });
  it("preserves uncertain Moon signs without inventing houses or Rising", () => {
    const chart = computeChart({ ...birth, time: null });
    const report = buildReport(chart, null, "placidus");
    expect(report.title).toContain("Taurus or Gemini Moon");
    expect(report.title).not.toContain("Rising");
    expect(report.sections[0].paragraphs.join(" ")).toContain("birth time is unknown");
    expect(report.sections[1].paragraphs.every((p) => !p.includes("Whole sign"))).toBe(true);
  });
  it("falls back to whole sign when polar Placidus is unavailable", () => {
    const chart = computeChart({ ...birth, place: { ...birth.place, lat: 78, label: "Polar test" } });
    expect(chart.cusps?.placidus).toBeNull();
    expect(buildReport(chart, null, "placidus").sections[0].paragraphs.join(" ")).toContain("Reading uses whole sign houses");
  });
});

describe("expanded synastry", () => {
  it("exposes all qualifying contacts while preserving the existing highlights", () => {
    const result = computeCouple(birth, { ...birth, date: "1988-03-05" });
    expect(result.allContacts.length).toBeGreaterThan(3);
    expect(result.contacts).toEqual(result.allContacts.slice(0, 3));
    const keys = result.allContacts.map((a) => `${a.a}-${a.b}-${a.type}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(result.allContacts.every((a) => ![a.a, a.b].some((p) => ["mc", "node", "chiron"].includes(p)))).toBe(true);
  });
  it("does not introduce angles when either birth time is unknown", () => {
    const result = computeCouple({ ...birth, time: null }, { ...birth, date: "1988-03-05", time: null });
    expect(result.allContacts.every((a) => ![a.a, a.b].includes("asc"))).toBe(true);
  });
});

describe("crawlable information architecture", () => {
  it("redirects page one before streaming and rejects invalid dynamic URLs", () => {
    const result = proxy(new NextRequest("https://example.com/charts/category/film/page/1"));
    expect(result?.status).toBe(308);
    expect(result?.headers.get("location")).toBe("https://example.com/charts/category/film");
    for (const path of ["/calculators/missing", "/learn/missing", "/charts/category/film/page/999", "/charts/category/film/page/02"]) {
      expect(proxy(new NextRequest(`https://example.com${path}`))?.status, path).toBe(404);
    }
    expect(proxy(new NextRequest("https://example.com/charts/category/film/page/2"))).toBeUndefined();
    expect(proxy(new NextRequest("https://example.com/charts/sitemap.xml"))).toBeUndefined();
  });
  it("keeps pagination counts in sync with the entire famous collection", () => {
    let linked = 0;
    for (const category of CATEGORIES) {
      const people = ALL_FAMOUS.filter((p) => p.category === category);
      const slug = category.toLowerCase();
      expect(CATEGORY_COUNTS[slug], slug).toBe(people.length);
      const pages = Array.from({ length: categoryPages(slug) }, (_, i) => people.slice(i * CATEGORY_PAGE_SIZE, (i + 1) * CATEGORY_PAGE_SIZE));
      expect(pages.flat()).toEqual(people);
      expect(pages.every((page) => page.length > 0 && page.length <= CATEGORY_PAGE_SIZE)).toBe(true);
      linked += pages.flat().length;
    }
    expect(linked).toBe(ALL_FAMOUS.length);
  });
  it("lists unique public URLs, every category page and all new tools and guides", () => {
    const urls = sitemap().map((u) => new URL(u.url).pathname);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).not.toContain("/report");
    expect(urls).toContain("/birth-chart-report");
    for (const tool of CALCULATORS) {
      expect(urls).toContain(`/calculators/${tool.slug}`);
      expect(GUIDES.some((guide) => guide.slug === tool.guide)).toBe(true);
    }
    for (const guide of GUIDES) expect(urls).toContain(`/learn/${guide.slug}`);
    for (const category of CATEGORIES) {
      const slug = category.toLowerCase();
      for (let page = 1; page <= categoryPages(slug); page++) expect(urls).toContain(categoryHref(slug, page));
    }
  });
  it("limits profile indexing to a separate launch-cohort sitemap", () => {
    const core = sitemap();
    const profiles = chartsSitemap();
    const profilePaths = profiles.map((u) => new URL(u.url).pathname);
    expect(core.every((u) => !new URL(u.url).pathname.match(/^\/charts\/[^/]+$/) || new URL(u.url).pathname === "/charts")).toBe(true);
    expect(profiles).toHaveLength(FAMOUS_INDEX_LIMIT);
    expect(profilePaths).toEqual(INDEXABLE_FAMOUS.map((person) => `/charts/${person.slug}`));
    expect(new Set(profilePaths).size).toBe(profilePaths.length);
    expect(profiles.every((entry) => !("priority" in entry) && !("changeFrequency" in entry))).toBe(true);
    expect(robots().sitemap).toEqual([
      expect.stringMatching(/\/sitemap\.xml$/),
      expect.stringMatching(/\/charts\/sitemap\.xml$/),
    ]);
  });
  it("keeps the profile indexing boundary aligned with the launch cohort", () => {
    expect(isFamousIndexable(INDEXABLE_FAMOUS.at(-1)!.slug)).toBe(true);
    expect(isFamousIndexable(ALL_FAMOUS[FAMOUS_INDEX_LIMIT].slug)).toBe(false);
  });
});
