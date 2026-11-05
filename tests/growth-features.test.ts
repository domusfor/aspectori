import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import { computeBirthTimeRange, computeChart, computeLunations, computeRetrogrades } from "@/lib/astro/engine";
import { pointMap } from "@/lib/astro/reading";
import { famousSignLabel, risingGuideSlug } from "@/lib/astro/signs";
import { SIGNS, signOf } from "@/lib/astro/zodiac";
import { FAMOUS } from "@/data/famous";
import { ALL_FAMOUS, famousBySlug } from "@/data/people";
import { CALCULATORS } from "@/data/calculators";
import { GUIDES, guideBySlug } from "@/data/guides";
import { RISING_GUIDES } from "@/data/rising-guides";
import { weeklyReminderIcs } from "@/lib/weekly-reminder";
import { safeLocation } from "@/lib/analytics";
import { generateMetadata } from "@/app/zodiac/[slug]/page";
import zodiacSitemap from "@/app/zodiac/sitemap";
import raw from "@/data/people.json";

const sofia = { date: "1990-08-14", time: null, place: { label: "Sofia, Bulgaria", lat: 42.6975, lon: 23.3241, tz: "Europe/Sofia" } };
const risingAt = (time: string) => signOf(pointMap(computeChart({ ...sofia, time })).asc!.lon);

describe("Birth Time Explorer", () => {
  it("agrees with the chart engine on both sides of every change", () => {
    const result = computeBirthTimeRange(sofia, "00:00", "23:59");
    expect(result.segments.length).toBeGreaterThanOrEqual(12);
    for (const segment of result.segments.slice(1)) {
      const [h, m] = segment.from.split(":").map(Number);
      const minutes = h * 60 + m;
      const clock = (t: number) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
      expect(risingAt(clock(minutes + 1))).toBe(segment.rising);
      expect(risingAt(clock(minutes - 1))).not.toBe(segment.rising);
    }
    expect(result.segments.reduce((sum, s) => sum + s.minutes, 0)).toBeCloseTo(result.totalMinutes, -1);
  });
  it("does not treat signs as equal two-hour blocks", () => {
    const full = computeBirthTimeRange(sofia, "00:00", "23:59").segments.slice(1, -1).map((s) => s.minutes);
    expect(Math.max(...full) - Math.min(...full)).toBeGreaterThan(30);
  });
  it("returns one sign for a narrow window and reports a Moon change", () => {
    const result = computeBirthTimeRange(FAMOUS[0].birth, "11:29", "11:31");
    expect(result.segments.map((s) => s.rising)).toEqual(["Cancer"]);
    const moon = computeBirthTimeRange(sofia, "00:00", "23:59");
    expect(moon.moonSigns).toEqual(["Taurus", "Gemini"]);
    expect(moon.moonChangeAt).toMatch(/^\d\d:\d\d$/);
  });
  it("rejects a window that ends before it starts", () => {
    expect(() => computeBirthTimeRange(sofia, "10:00", "09:00")).toThrow("after the earliest");
  });
  it("keeps the two whole sign house numbers consistent with the Rising sign", () => {
    const [segment] = computeBirthTimeRange(FAMOUS[0].birth, "11:29", "11:31").segments;
    const chart = pointMap(computeChart(FAMOUS[0].birth));
    expect(segment.sunHouse).toBe(chart.sun.houses!.whole);
    expect(segment.moonHouse).toBe(chart.moon.houses!.whole);
  });
});

describe("sky calendars", () => {
  it("finds the known 2026 Mercury retrograde periods", () => {
    const list = computeRetrogrades("mercury", DateTime.utc(2026, 1, 1), DateTime.utc(2027, 1, 1));
    expect(list.map((p) => p.start.slice(0, 10))).toEqual(["2026-02-26", "2026-06-29", "2026-10-24"]);
    expect(list.map((p) => p.end.slice(0, 7))).toEqual(["2026-03", "2026-07", "2026-11"]);
  });
  it("finds new and full Moons at their known dates", () => {
    const list = computeLunations(DateTime.utc(2026, 1, 1), DateTime.utc(2027, 1, 1));
    expect(list.length).toBeGreaterThanOrEqual(24);
    expect(list.some((l) => l.type === "full" && l.at.startsWith("2026-03-03"))).toBe(true);
    expect(list.some((l) => l.type === "new" && l.at.startsWith("2026-08-12"))).toBe(true);
    list.slice(1).forEach((l, i) => expect(l.type).not.toBe(list[i].type));
  });
});

describe("zodiac wording and indexing", () => {
  it.each(SIGNS.map((s) => [s] as const))("%s has no malformed plural", async (sign) => {
    const meta = await generateMetadata({ params: Promise.resolve({ slug: sign.toLowerCase() }) });
    const bad = /\b\w+(?:ss|us|es)s\b|\b(?:Aries|Taurus|Pisces|Gemini|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Cancer)s\b/;
    expect(String(meta.title)).not.toMatch(bad);
    expect(famousSignLabel(sign)).not.toMatch(bad);
    expect(meta.robots).toBeUndefined();
  });
  it("keeps Sun-Moon combination pages out of the index and the sitemap", async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ slug: "aries-sun-leo-moon" }) });
    expect(meta.robots).toEqual({ index: false, follow: true });
    expect(zodiacSitemap()).toHaveLength(12);
  });
});

describe("Rising guides", () => {
  it("covers all twelve signs with unique titles and descriptions", () => {
    expect(RISING_GUIDES.map((g) => g.rising)).toEqual(SIGNS);
    for (const field of ["title", "description", "summary"] as const) expect(new Set(RISING_GUIDES.map((g) => g[field])).size).toBe(12);
    for (const sign of SIGNS) expect(guideBySlug(risingGuideSlug(sign))?.rising).toBe(sign);
  });
  it("has distinct hand-written interpretation in every guide", () => {
    const opening = RISING_GUIDES.map((g) => g.sections[0].paragraphs.join(" "));
    expect(new Set(opening).size).toBe(12);
    for (const guide of RISING_GUIDES) expect(guide.sections.flatMap((s) => s.paragraphs).join(" ").split(/\s+/).length).toBeGreaterThan(280);
  });
  it("links every guide and calculator to something that exists", () => {
    for (const guide of GUIDES) expect(CALCULATORS.some((tool) => tool.slug === guide.tool), guide.slug).toBe(true);
    expect(CALCULATORS.some((tool) => tool.slug === "birth-time-explorer")).toBe(true);
  });
});

describe("celebrity data", () => {
  it("publishes the sourced birth time instead of its date-only twin", () => {
    const trump = famousBySlug("donald-trump")!;
    expect(trump.rating).toBe("AA");
    expect(trump.birth.time).toBe("10:54");
    expect(ALL_FAMOUS.filter((f) => f.wikidata === "Q22686")).toHaveLength(1);
    expect((raw as { q: string }[]).some((r) => FAMOUS.some((f) => f.wikidata === r.q))).toBe(false);
  });
  it("files the people the audit flagged under a sensible field", () => {
    const field = (slug: string) => famousBySlug(slug)!.category;
    expect(field("carl-benz")).toBe("Science");
    expect(field("bruce-lee")).toBe("Sport");
    expect(field("jet-li")).toBe("Sport");
    expect(field("mao-zedong")).toBe("Politics");
    expect(field("vincent-van-gogh")).toBe("Art");
  });
});

describe("weekly reminder", () => {
  it("repeats on Mondays and contains only a link", () => {
    const ics = weeklyReminderIcs("https://aspectori.com/weekly-horoscope", new Date(2026, 10, 5, 12));
    expect(ics).toContain("RRULE:FREQ=WEEKLY");
    expect(ics).toContain("DTSTART:20261109T090000");
    expect(ics).toContain("URL:https://aspectori.com/weekly-horoscope");
  });
  it("never schedules the first reminder for today", () => {
    expect(weeklyReminderIcs("https://x.test/", new Date(2026, 10, 9, 8))).toContain("DTSTART:20261116T090000");
  });
});

describe("analytics", () => {
  it("reports only the origin and path, never the birth details in the fragment", () => {
    const location = { origin: "https://aspectori.com", pathname: "/calculators/rising-sign", hash: "#b=1990-08-14~14:30~42.7~23.3~Europe/Sofia~Sofia" };
    expect(safeLocation(location)).toBe("https://aspectori.com/calculators/rising-sign");
  });
});

describe("search snippets", () => {
  it("keeps guide and calculator titles and descriptions short enough to display", () => {
    for (const page of [...GUIDES, ...CALCULATORS]) {
      expect(`${page.title} | Aspectori`.length, page.slug).toBeLessThanOrEqual(62);
      expect(page.description.length, page.slug).toBeLessThanOrEqual(160);
    }
  });
});
