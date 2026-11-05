// The accuracy gate: Sun, Moon and Ascendant must match Astro.com to the arcminute
// for every reference chart before anything else counts.
import { describe, expect, it } from "vitest";
import { computeChart } from "@/lib/astro/engine";
import { resolveMoment } from "@/lib/astro/time";
import { adbOffset, coords, delta, REFERENCE, referenceInput as input } from "@/lib/astro/reference";
import { FAMOUS } from "@/data/famous";

const data = { charts: REFERENCE };

describe("engine matches Astro.com (using Astro.com's own UTC offset)", () => {
  it.each(data.charts.map((f) => [f.name, f] as const))("%s", (_, f) => {
    const chart = computeChart(input(f, adbOffset(f.adbZone)));
    const pos = Object.fromEntries(chart.points.map((p) => [p.id, p.lon]));
    // Exact to the printed arcminute.
    expect(delta(pos.sun, f.sun)).toBe(0);
    expect(delta(pos.moon, f.moon)).toBe(0);
    expect(delta(pos.asc, f.asc)).toBe(0);
  });
});

// Where our time zone pipeline knowingly differs from Astro.com's atlas. Each one is a
// railway/city mean time the tz database cannot tell apart from local mean time.
const KNOWN_TZ_DIFFERENCES: Record<string, string> = {
  "Sigmund Freud": "Astro.com uses Prague mean time for Příbor in 1856; tz data has LMT and PMT at the same offset, so we use Příbor's own mean time.",
  "Mohandas Gandhi": "Astro.com uses Porbandar mean time; tz data puts all of India on Howrah mean time from 1854.",
  "Martin Luther King Jr.": "Astro.com has Atlanta on Central time in 1929; tz data groups Atlanta with New York. The published chart sets the offset by hand.",
  "Bill Clinton": "Astro.com has Hope, Arkansas on standard time in August 1946; tz data applies Chicago's summer time. The published chart sets the offset by hand.",
};

describe("time zone pipeline agrees with Astro.com's atlas", () => {
  it.each(data.charts.map((f) => [f.name, f] as const))("%s", (name, f) => {
    const { lon } = coords(f.coords);
    const ours = resolveMoment(f.date, f.time, { tz: f.tz, lon }).offset;
    const diffSeconds = Math.abs(ours - adbOffset(f.adbZone)) * 60;
    if (KNOWN_TZ_DIFFERENCES[name]) expect(diffSeconds).toBeGreaterThan(30);
    else expect(diffSeconds).toBeLessThan(30);
  });
});

describe("published famous charts reproduce Astro.com", () => {
  it.each(FAMOUS.map((f) => [f.name, f] as const))("%s", (name, f) => {
    const ref = data.charts.find((c) => c.date === f.birth.date)!;
    expect(ref, `no Astro.com fixture for ${name}`).toBeDefined();
    const chart = computeChart(f.birth);
    const pos = Object.fromEntries(chart.points.map((p) => [p.id, p.lon]));
    expect(delta(pos.sun, ref.sun)).toBe(0);
    expect(delta(pos.moon, ref.moon)).toBe(0);
    expect(delta(pos.asc, ref.asc)).toBe(0);
  });
});
