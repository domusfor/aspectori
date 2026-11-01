import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import { computeChart, computeSky, computeWeek } from "@/lib/astro/engine";
import { ASPECT_BY_TYPE } from "@/lib/astro/aspects";
import { weekReading } from "@/lib/astro/week-reading";
import { POST } from "@/app/api/week/route";

const birth = { date: "1990-08-14", time: "14:30", place: { label: "Sofia, Bulgaria", lat: 42.6975, lon: 23.3241, tz: "Europe/Sofia" } };
const now = DateTime.fromISO("2026-10-20T12:34:00Z");
const week = computeWeek(birth, now);

describe("personal weekly transits", () => {
  it("uses seven inclusive UTC dates and excludes the fast transiting Moon", () => {
    expect(week.from).toBe("2026-10-20");
    expect(week.to).toBe("2026-10-26");
    expect(week.timeZone).toBe("UTC");
    expect(week.sampleHours).toBe(6);
    expect(week.transits.length).toBeGreaterThan(0);
    expect(week.transits.length).toBeLessThanOrEqual(3);
    expect(week.qualifyingContacts).toBeGreaterThanOrEqual(week.transits.length);
    expect(week.transits.some((t) => t.planet === "moon")).toBe(false);
    expect(new Set(week.transits.map((t) => `${t.planet}-${t.target}-${t.type}`)).size).toBe(week.transits.length);
  });

  it.each([
    ["2026-12-29T12:00:00Z", "2026-12-29", "2027-01-04"],
    ["2028-02-26T12:00:00Z", "2028-02-26", "2028-03-03"],
    ["2026-10-20T00:30:00+09:00", "2026-10-19", "2026-10-25"],
  ])("handles UTC, month, year and leap boundaries: %s", (iso, from, to) => {
    const result = computeWeek(birth, DateTime.fromISO(iso, { setZone: true }));
    expect(result.from).toBe(from); expect(result.to).toBe(to);
    for (const transit of result.transits) expect(transit.activeDates.every((date) => date >= from && date <= to)).toBe(true);
  });

  it("publishes positions and orbs reproducible from independently calculated sky and natal charts", () => {
    const chart = computeChart(birth);
    for (const transit of week.transits) {
      const at = DateTime.fromISO(transit.closestAt);
      const sky = computeSky(at);
      const moving = sky.chart.points.find((p) => p.id === transit.planet)!.lon;
      const natal = chart.points.find((p) => p.id === transit.target)!.lon;
      const raw = Math.abs(moving - natal);
      const orb = Math.abs(Math.min(raw, 360 - raw) - ASPECT_BY_TYPE[transit.type].angle);
      expect(transit.transitLon).toBeCloseTo(moving, 8);
      expect(transit.natalLongitudes).toEqual([natal]);
      expect(transit.maxOrb).toBeCloseTo(orb, 8);
      expect(transit.minOrb).toBeCloseTo(orb, 8);
      expect(orb).toBeLessThanOrEqual(1);
      expect(at.toUTC().hour % 6).toBe(0);
      expect(transit.activeDates).toContain(at.toUTC().toISODate());
    }
  });

  it("marks only dates with a qualifying sampled contact and includes every qualifying date for selected contacts", () => {
    const chart = computeChart(birth);
    const skies = Array.from({ length: 28 }, (_, i) => {
      const at = DateTime.fromISO(`${week.from}T00:00:00Z`).plus({ hours: i * 6 });
      return { date: at.toUTC().toISODate()!, points: computeSky(at).chart.points };
    });
    for (const transit of week.transits) {
      const natal = chart.points.find((p) => p.id === transit.target)!.lon;
      const dates = skies.filter(({ points }) => {
        const moving = points.find((p) => p.id === transit.planet)!.lon;
        const raw = Math.abs(moving - natal);
        return Math.abs(Math.min(raw, 360 - raw) - ASPECT_BY_TYPE[transit.type].angle) <= 1;
      }).map(({ date }) => date);
      expect(transit.activeDates).toEqual([...new Set(dates)]);
    }
  });

  it("respects missing birth times and reports only measured endpoint orbs", () => {
    const result = computeWeek({ ...birth, time: null }, now);
    expect(result.timeKnown).toBe(false);
    expect(result.skippedTargets).toEqual(["moon", "asc", "mc"]);
    expect(result.transits.length).toBeGreaterThan(0);
    for (const transit of result.transits) {
      expect(result.skippedTargets).not.toContain(transit.target);
      expect(transit.natalLongitudes).toHaveLength(2);
      const orbs = transit.natalLongitudes.map((lon) => {
        const raw = Math.abs(transit.transitLon - lon);
        return Math.abs(Math.min(raw, 360 - raw) - ASPECT_BY_TYPE[transit.type].angle);
      });
      expect(transit.maxOrb).toBeCloseTo(Math.max(...orbs), 8);
      expect(transit.minOrb).toBeCloseTo(Math.min(...orbs), 8);
      expect(orbs.every((orb) => orb <= 1)).toBe(true);
    }
  });

  it("is deterministic for fixed inputs but changes with the birth chart", () => {
    expect(computeWeek(birth, now)).toEqual(week);
    expect(computeWeek({ ...birth, date: "1988-03-05" }, now).transits).not.toEqual(week.transits);
    for (const transit of week.transits) {
      const reading = weekReading(transit);
      expect(reading.interpretation).toContain("In astrological tradition");
      expect(reading.prompt).toMatch(/\?$/);
    }
  });
});

describe("weekly endpoint", () => {
  it("returns private calculations with no-store and ignores a caller-selected window", async () => {
    const response = await POST(new Request("http://localhost/api/week", { method: "POST", body: JSON.stringify({ ...birth, refreshDay: "1900-01-01", from: "1900-01-01" }) }));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const result = await response.json();
    expect(result.from).toBe(result.calculatedAt.slice(0, 10));
    expect(result.from).not.toBe("1900-01-01");
    expect(result).not.toHaveProperty("input");
  });
  it.each(["{", "null", "[]", JSON.stringify({ ...birth, date: "1990-02-30" })])("rejects malformed birth input: %s", async (body) => {
    const response = await POST(new Request("http://localhost/api/week", { method: "POST", body }));
    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty("error");
  });
});
