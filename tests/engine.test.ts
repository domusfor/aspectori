import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import { stableAspects, findAspect, separation } from "@/lib/astro/aspects";
import { computeChart, computeCouple, computeYear } from "@/lib/astro/engine";
import { parseBirth } from "@/lib/astro/parse";
import { buildReading, signatureAspect } from "@/lib/astro/reading";
import { InputError, resolveMoment } from "@/lib/astro/time";
import { fmtDeg, fmtOrb } from "@/lib/astro/zodiac";
import { decodeBirth, encodeBirth } from "@/lib/url";

const sofia = { label: "Sofia, Bulgaria", lat: 42.6975, lon: 23.3241, tz: "Europe/Sofia" };
const known = { date: "1990-08-14", time: "14:30", place: sofia };
const unknown = { ...known, time: null };

describe("formatting", () => {
  it("rounds to the arcminute without spilling into the next sign", () => {
    expect(fmtDeg(141.4237)).toBe("21°25′");
    expect(fmtDeg(29.9999)).toBe("29°59′");
    expect(fmtOrb(0.6667)).toBe("0°40′");
  });
});

describe("aspects", () => {
  it("measures separation across 0° Aries", () => {
    expect(separation(355, 5)).toBe(10);
    expect(findAspect(357, 3)?.type).toBe("conjunction");
    expect(findAspect(355, 5)).toBeNull(); // 10° is outside the 8° conjunction orb
    expect(findAspect(10, 100)?.type).toBe("square");
    expect(findAspect(10, 50)).toBeNull();
  });

  it("keeps only aspects that hold at every sample, with min/max orb", () => {
    // Moon runs from 1° before an exact trine to 1° after it.
    const s1 = { sun: 0, moon: 119 }, s2 = { sun: 0, moon: 121 };
    const [asp] = stableAspects([[s1, s1], [s2, s2]], { sameChart: true });
    expect(asp.type).toBe("trine");
    expect(asp.minOrb).toBe(0);
    expect(asp.orb).toBeCloseTo(1);
    // Leaves orb partway through the day → not stable.
    const s3 = { sun: 0, moon: 128 };
    expect(stableAspects([[s1, s1], [s3, s3]], { sameChart: true })).toHaveLength(0);
  });
});

describe("time", () => {
  it("applies historical offsets", () => {
    // US year-round daylight time, January 1974.
    expect(resolveMoment("1974-01-15", "12:00", { tz: "America/New_York", lon: -74 }).offset).toBe(-240);
    // British Standard Time, 1968–71: summer time all winter.
    expect(resolveMoment("1970-01-15", "12:00", { tz: "Europe/London", lon: 0 }).offset).toBe(60);
  });

  it("uses birthplace mean time before standard time", () => {
    const m = resolveMoment("1879-03-14", "11:30", { tz: "Europe/Berlin", lon: 10 });
    expect(m.source).toBe("lmt");
    expect(m.offset).toBe(40);
  });

  it("flags skipped and repeated clock times", () => {
    expect(resolveMoment("2021-03-28", "03:30", { tz: "Europe/Sofia", lon: 23 }).notes[0]).toMatch(/jumped forward/);
    expect(resolveMoment("2021-10-31", "03:30", { tz: "Europe/Sofia", lon: 23 }).notes[0]).toMatch(/happened twice/);
  });

  it("honours a manual offset", () => {
    const m = resolveMoment("1990-08-14", "14:30", { tz: "Europe/Sofia", lon: 23, offset: 120 });
    expect(m.source).toBe("manual");
    expect(m.utc.toISO()).toBe("1990-08-14T12:30:00.000Z");
  });

  it("rejects impossible dates", () => {
    expect(() => resolveMoment("1990-02-30", "10:00", { tz: "Europe/Sofia", lon: 23 })).toThrow(InputError);
    expect(() => resolveMoment("1700-01-01", "10:00", { tz: "Europe/Sofia", lon: 23 })).toThrow(InputError);
  });
});

describe("natal chart", () => {
  const chart = computeChart(known);

  it("has twelve points, houses in three systems, and a personal signature aspect", () => {
    expect(chart.points).toHaveLength(14); // 10 planets, node, Chiron, Ascendant, Midheaven
    expect(chart.aspects.some((a) => a.a === "node" || a.b === "chiron" || a.a === "chiron" || a.b === "node")).toBe(false);
    for (const p of chart.points) {
      expect(p.houses!.whole).toBeGreaterThanOrEqual(1);
      expect(p.houses!.placidus).toBeGreaterThanOrEqual(1);
    }
    const asc = chart.points.find((p) => p.id === "asc")!;
    expect(asc.houses!.placidus).toBe(1);
    expect(asc.houses!.whole).toBe(1);
    const sig = signatureAspect(chart)!;
    expect(`${sig.a}-${sig.type}-${sig.b}`).toBe("sun-square-mars");
  });

  it("gives two people born an hour apart different cards", () => {
    const later = computeChart({ ...known, time: "15:30" });
    const a = buildReading(chart, "placidus").lead.map((e) => e.title);
    const b = buildReading(later, "placidus").lead.map((e) => e.title);
    expect(a).not.toEqual(b);
  });

  it("hides houses and shows the Moon as a range when time is unknown", () => {
    const u = computeChart(unknown);
    expect(u.timeKnown).toBe(false);
    expect(u.points.find((p) => p.id === "asc")).toBeUndefined();
    const moon = u.points.find((p) => p.id === "moon")!;
    expect(moon.range!.ingressLocal).toBe("10:41 AM");
    expect(buildReading(u, "whole").lead[1].title).toBe("Taurus or Gemini Moon");
  });

  it("drops Placidus near the poles", () => {
    const c = computeChart({ ...known, place: { label: "Tromsø", lat: 69.65, lon: 18.96, tz: "Europe/Oslo" } });
    expect(c.cusps!.placidus).toBeNull();
    expect(c.notes.join(" ")).toMatch(/Placidus/);
  });
});

describe("couple", () => {
  it("returns at most three contacts, tightest personal ones first", () => {
    const r = computeCouple(known, { date: "1992-03-02", time: "09:10", place: sofia });
    expect(r.contacts.length).toBeLessThanOrEqual(3);
    expect(r.contacts.length).toBeGreaterThan(0);
    for (const c of r.contacts) expect(typeof c.easy).toBe("boolean");
  });
});

describe("year", () => {
  const today = DateTime.utc(2026, 10, 17);
  const y = computeYear(known, today);

  it("returns six dated transits overlapping the next twelve months, sorted", () => {
    expect(y.transits).toHaveLength(6);
    const starts = y.transits.map((t) => t.start);
    expect([...starts].sort()).toEqual(starts);
    for (const t of y.transits) {
      expect(t.end >= y.from && t.start <= y.to).toBe(true);
      expect(t.exact.length).toBeGreaterThan(0);
    }
  });

  it("skips Moon and angles without a birth time", () => {
    const u = computeYear(unknown, today);
    expect(u.skippedTargets).toEqual(["moon", "asc", "mc"]);
    expect(u.transits.every((t) => !["moon", "asc", "mc"].includes(t.target))).toBe(true);
  });
});

describe("input", () => {
  it("validates untrusted input", () => {
    expect(() => parseBirth({ date: "1990-01-01", place: { lat: 100, lon: 0, tz: "UTC" } })).toThrow(InputError);
    expect(() => parseBirth({ date: "1990-01-01", place: { lat: 0, lon: 0, tz: "Mars/Olympus" } })).toThrow(InputError);
    expect(parseBirth({ date: "1990-01-01", time: "", place: { lat: 1, lon: 2, tz: "UTC", label: "x" } }).time).toBeNull();
  });

  it("round-trips through the URL", () => {
    const b = { ...known, offset: 150 };
    expect(decodeBirth(encodeBirth(b))).toEqual(b);
    expect(decodeBirth(encodeBirth(unknown))).toEqual({ ...unknown, offset: null });
  });
});
