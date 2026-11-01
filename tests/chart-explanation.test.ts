import { describe, expect, it } from "vitest";
import { computeChart } from "@/lib/astro/engine";
import { aspectRef } from "@/lib/astro/reading";
import { explainChartRef } from "@/lib/chart-explanation";
import { SLOW } from "@/lib/astro/zodiac";

const birth = { date: "1990-08-14", time: "14:30", place: { label: "Sofia", lat: 42.6975, lon: 23.3241, tz: "Europe/Sofia" } };
const chart = computeChart(birth);

describe("chart explanations", () => {
  it("resolves every planet glyph and every aspect that can be drawn", () => {
    for (const point of chart.points) {
      const explanation = explainChartRef(chart, "placidus", point.id)!;
      expect(explanation.entry.ref).toBe(point.id);
      expect(explanation.entry.evidence).toHaveLength(1);
      expect(explanation.theme).toBeTruthy();
      expect(explanation.prompt).toBeTruthy();
    }
    for (const aspect of chart.aspects.filter((a) => !(SLOW.has(a.a) && SLOW.has(a.b)))) {
      const explanation = explainChartRef(chart, "placidus", aspectRef(aspect))!;
      expect(explanation.kind).toBe("aspect");
      expect(explanation.entry.evidence).toHaveLength(2);
      expect(explanation.geometry).toContain("shorter angle");
    }
  });
  it("changes house evidence with the system while preserving sign evidence", () => {
    const point = chart.points.find((p) => p.houses && p.houses.placidus !== p.houses.whole)!;
    expect(point).toBeTruthy();
    const placidus = explainChartRef(chart, "placidus", point.id)!;
    const whole = explainChartRef(chart, "whole", point.id)!;
    expect(placidus.entry.evidence[0].position).toBe(whole.entry.evidence[0].position);
    expect(placidus.entry.evidence[0].house).not.toBe(whole.entry.evidence[0].house);
    expect(placidus.entry.evidence[0].house).toContain("Placidus");
    expect(whole.entry.evidence[0].house).toContain("whole sign");
  });
  it("does not invent Rising or houses when time is missing", () => {
    const unknown = computeChart({ ...birth, time: null });
    expect(explainChartRef(unknown, "placidus", "asc")).toBeNull();
    const moon = explainChartRef(unknown, "placidus", "moon")!;
    expect(moon.entry.evidence[0].house).toBeUndefined();
    expect(moon.uncertainty).toContain("endpoint");
    const aspect = explainChartRef(unknown, "whole", aspectRef(unknown.aspects[0]))!;
    expect(aspect.geometry).toContain("not a continuous bound");
    expect(aspect.geometry).not.toContain("shorter angle between");
  });
  it("preserves both interpretations when endpoint signs differ", () => {
    const uncertain = { ...chart, timeKnown: false, points: chart.points.map((p) => p.id === "moon" ? { ...p, houses: undefined, range: { start: 29, end: 41, ingressLocal: "02:00" } } : p) };
    const explanation = explainChartRef(uncertain, "whole", "moon")!;
    expect(explanation.entry.title).toBe("Aries or Taurus Moon");
    expect(explanation.entry.lines).toHaveLength(2);
    expect(explanation.entry.lines[0]).toContain("Born before 02:00");
    expect(explanation.entry.lines[1]).toContain("Born after");
  });
  it("uses whole-sign evidence consistently for polar charts", () => {
    const polar = computeChart({ ...birth, place: { label: "Longyearbyen", lat: 78.2232, lon: 15.6469, tz: "Arctic/Longyearbyen" } });
    expect(polar.cusps?.placidus).toBeNull();
    const explanation = explainChartRef(polar, "placidus", "sun")!;
    expect(explanation.system).toBe("whole");
    expect(explanation.entry.evidence[0].house).toContain("whole sign");
  });
  it("does not fabricate an explanation for a stale selection", () => {
    expect(explainChartRef(chart, "whole", "not-a-point")).toBeNull();
    expect(explainChartRef(chart, "whole", "asp-sun-sun")).toBeNull();
  });
});
