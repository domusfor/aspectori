import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import { FAMOUS } from "@/data/famous";
import { ALL_FAMOUS, famousBySlug } from "@/data/people";
import slugs from "@/data/people-slugs.json";
import { computeChart } from "@/lib/astro/engine";
import { summarize } from "@/lib/famous-summary";
import { fmtPos } from "@/lib/astro/zodiac";

describe("famous people data", () => {
  it("has unique, URL-safe slugs and every slug is known to the 404 proxy", () => {
    const all = ALL_FAMOUS.map((f) => f.slug);
    expect(new Set(all).size).toBe(all.length);
    for (const s of all) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    const proxy = new Set([...FAMOUS.map((f) => f.slug), ...(slugs as string[])]);
    expect(all.every((s) => proxy.has(s))).toBe(true);
  });

  it("has valid dates, coordinates and time zones for every person", () => {
    for (const f of ALL_FAMOUS) {
      const d = DateTime.fromISO(f.birth.date, { zone: f.birth.place.tz });
      expect(d.isValid, `${f.slug} ${f.birth.date} ${f.birth.place.tz}`).toBe(true);
      expect(Math.abs(f.birth.place.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(f.birth.place.lon)).toBeLessThanOrEqual(180);
    }
  });

  it("puts curated charts with recorded times first and keeps imported ones date-only", () => {
    expect(ALL_FAMOUS[0].rating).not.toBe("X");
    expect(ALL_FAMOUS.filter((f) => f.rating === "X").every((f) => f.birth.time === null)).toBe(true);
  });

  it("gets well-known Sun signs right", () => {
    const sun = (slug: string) => summarize(famousBySlug(slug)!).sun;
    expect(sun("taylor-swift")).toEqual(["Sagittarius"]);
    expect(sun("beyonce")).toEqual(["Virgo"]);
    expect(sun("lionel-messi")).toEqual(["Cancer"]);
    expect(sun("frida-kahlo")).toEqual(["Cancer"]);
  });
});

describe("fixed stars", () => {
  it("finds Einstein's Ascendant on Sirius and Pluto on Algol", () => {
    const e = computeChart(FAMOUS[0].birth);
    const found = e.stars.map((s) => `${s.point}:${s.star}:${fmtPos(s.lon)}`);
    expect(found).toContain("asc:Sirius:12°25′ Cancer");
    expect(found).toContain("pluto:Algol:24°29′ Taurus");
  });
});

describe("precomputed summaries", () => {
  it("match a fresh computation (rerun `npm run data:summaries` after engine changes)", async () => {
    const pre = (await import("@/data/people-summary.json")).default as [string, string, string, string][];
    expect(pre.length).toBe(ALL_FAMOUS.filter((f) => f.rating === "X").length);
    for (const [slug, sun, moon, sig] of pre.filter((_, i) => i % 400 === 0)) {
      const s = summarize(famousBySlug(slug)!);
      expect([s.sun.join("/"), s.moon.join("/"), s.signature ?? ""], slug).toEqual([sun, moon, sig]);
    }
  });
});
