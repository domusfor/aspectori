import { describe, expect, it } from "vitest";
import { computeBirthMoon, computeChart } from "@/lib/astro/engine";
import { chartRulers, annualProfection, completedAge } from "@/lib/astro/rulership";
import { moonPhaseName } from "@/lib/astro/moon-phase";
import { POST } from "@/app/api/birth-moon/route";

const birth = { date: "1990-08-14", time: "14:30", place: { label: "Sofia, Bulgaria", lat: 42.6975, lon: 23.3241, tz: "Europe/Sofia" } };
const chart = computeChart(birth);

describe("chart rulers and annual profections", () => {
  it("distinguishes traditional and modern Scorpio rulers using the actual natal planets", () => {
    const result = chartRulers(chart)!;
    expect(result.sign).toBe("Scorpio");
    expect(result.traditional).toEqual(chart.points.find((p) => p.id === "mars"));
    expect(result.modern).toEqual(chart.points.find((p) => p.id === "pluto"));
    expect(chartRulers(computeChart({ ...birth, time: null }))).toBeNull();
  });
  it.each([[0, 1, "Scorpio", "mars"], [1, 2, "Sagittarius", "jupiter"], [3, 4, "Aquarius", "saturn"], [4, 5, "Pisces", "jupiter"], [12, 1, "Scorpio", "mars"], [24, 1, "Scorpio", "mars"], [35, 12, "Libra", "venus"], [36, 1, "Scorpio", "mars"]] as const)("counts age %i using whole signs and traditional rulers", (age, house, sign, ruler) => {
    const result = annualProfection(chart, age);
    expect(result.house).toBe(house); expect(result.sign).toBe(sign); expect(result.ruler).toBe(ruler);
  });
  it("counts completed birthday years and rejects dates before birth", () => {
    expect(completedAge(birth.date, "2026-08-13")).toBe(35);
    expect(completedAge(birth.date, "2026-08-14")).toBe(36);
    expect(completedAge(birth.date, "1990-08-14")).toBe(0);
    expect(completedAge(birth.date, "1990-08-13")).toBeNull();
    const result = annualProfection(chart, 36);
    expect(result.from).toBe("2026-08-14"); expect(result.until).toBe("2027-08-14");
  });
  it("makes the leap-day birthday convention consistent in ages and intervals", () => {
    const leap = computeChart({ ...birth, date: "2000-02-29" });
    expect(completedAge(leap.input.date, "2025-02-27")).toBe(24);
    expect(completedAge(leap.input.date, "2025-02-28")).toBe(25);
    expect(completedAge(leap.input.date, "2024-02-28")).toBe(23);
    expect(completedAge(leap.input.date, "2024-02-29")).toBe(24);
    expect(annualProfection(leap, 24).until).toBe("2025-02-28");
  });
  it("gives only the age-based house number without a birth time", () => {
    const result = annualProfection(computeChart({ ...birth, time: null }), 37);
    expect(result.house).toBe(2);
    expect(result.sign).toBeNull(); expect(result.ruler).toBeNull(); expect(result.rulerPoint).toBeNull();
  });
  it.each([-1, 121, 1.5, NaN, Infinity])("rejects invalid ages: %s", (age) => {
    expect(() => annualProfection(chart, age)).toThrow(RangeError);
  });
});

describe("birth Moon phase", () => {
  // Independent published events: https://www.timeanddate.com/news/astronomy/moon-october-2026
  it.each([
    ["2026-10-03", "13:25", "Near last quarter", 49, 51, false],
    ["2026-10-10", "15:50", "Near new Moon", 0, 0.3, null],
    ["2026-10-18", "16:12", "Near first quarter", 49, 51, true],
    ["2026-10-26", "04:11", "Near full Moon", 99.7, 100, null],
  ] as const)("agrees with the independently published %s primary phase", (date, time, phase, min, max, waxing) => {
    const result = computeBirthMoon({ ...birth, date, time, offset: 0 });
    expect(result.timeKnown).toBe(true); expect(result.samples).toHaveLength(1);
    expect(result.phases).toEqual([phase]);
    expect(result.samples[0].illumination).toBeGreaterThanOrEqual(min);
    expect(result.samples[0].illumination).toBeLessThanOrEqual(max);
    if (waxing !== null) expect(result.samples[0].waxing).toBe(waxing);
  });
  it("normalizes phase labels across zero without treating an entire day as an exact event", () => {
    expect(moonPhaseName(359)).toBe("Near new Moon");
    expect(moonPhaseName(-1)).toBe("Near new Moon");
    expect(moonPhaseName(370)).toBe("Waxing crescent");
    expect(moonPhaseName(190)).toBe("Waning gibbous");
  });
  it("resolves equivalent local moments to the same Moon result", () => {
    const local = computeBirthMoon(birth);
    const utc = computeBirthMoon({ ...birth, time: "11:30", offset: 0 });
    expect(local.samples).toEqual(utc.samples);
  });
  it.each([["2021-03-28", 24], ["2021-10-31", 26]] as const)("samples the full local DST day %s, including its last second", (date, count) => {
    const result = computeBirthMoon({ ...birth, date, time: null });
    expect(result.timeKnown).toBe(false);
    expect(result.samples).toHaveLength(count);
    expect(result.samples.at(-1)!.at).toContain(":59:59.");
    expect(result.maxIllumination).toBeGreaterThan(result.minIllumination);
    expect(result.samples.every((s) => s.illumination >= 0 && s.illumination <= 100)).toBe(true);
  });
  it("retains uncertainty across a phase boundary", () => {
    const result = computeBirthMoon({ ...birth, date: "2026-10-19", time: null, offset: 0 });
    expect(result.phases).toEqual(["Near first quarter", "Waxing gibbous"]);
    expect(result.samples).toHaveLength(25);
  });
  it("validates the API and prevents personalized response caching", async () => {
    const valid = await POST(new Request("http://localhost/api/birth-moon", { method: "POST", body: JSON.stringify(birth) }));
    expect(valid.status).toBe(200);
    expect(valid.headers.get("cache-control")).toBe("no-store");
    expect((await valid.json()).samples).toHaveLength(1);
    const invalid = await POST(new Request("http://localhost/api/birth-moon", { method: "POST", body: '{"date":"bad"}' }));
    expect(invalid.status).toBe(400);
  });
});
