import { describe, expect, it } from "vitest";
import { computeChart, computeCouple } from "@/lib/astro/engine";
import { comparisonOverlays, houseOf, houseOverlay, OVERLAY_ENDPOINTS } from "@/lib/astro/house-overlays";
import { BODY_IDS } from "@/lib/astro/zodiac";
import { buildReport } from "@/lib/report";

const birth = { date: "1990-08-14", time: "14:30", place: { label: "Sofia, Bulgaria", lat: 42.6975, lon: 23.3241, tz: "Europe/Sofia" } };
const other = { ...birth, date: "1988-03-05", time: "09:15" };
const chart = computeChart(birth);

describe("house-sector boundaries", () => {
  const cusps = [350, 20, 50, 80, 110, 140, 170, 200, 230, 260, 290, 320];
  it("includes each exact cusp in its new house, including the zodiac wrap", () => {
    cusps.forEach((cusp, index) => {
      expect(houseOf(cusp, cusps)).toBe(index + 1);
      expect(houseOf(cusp - 0.000001, cusps)).toBe(index === 0 ? 12 : index);
    });
    expect(houseOf(0, cusps)).toBe(1);
    expect(houseOf(360, cusps)).toBe(1);
    expect(houseOf(-1, cusps)).toBe(1);
  });
  it("respects unequal sectors rather than dividing longitude into equal houses", () => {
    const unequal = [350, 5, 60, 90, 115, 140, 170, 185, 240, 270, 295, 320];
    expect(houseOf(10, unequal)).toBe(2);
    expect(houseOf(55, unequal)).toBe(2);
    expect(houseOf(60, unequal)).toBe(3);
  });
});

describe("directional house overlays", () => {
  it("uses the receiving person's houses and only the ten planets", () => {
    const owner = { ...chart, cusps: { ...chart.cusps!, whole: Array.from({ length: 12 }, (_, i) => i * 30) } };
    const visitor = { ...chart, points: chart.points.map((p) => p.id === "sun" ? { ...p, lon: 95 } : p) };
    const overlay = houseOverlay(visitor, owner);
    expect(overlay.rows.map((row) => row.planet)).toEqual([...BODY_IDS]);
    expect(overlay.rows[0].whole).toEqual([4]);
    expect(overlay.rows[0].positions).toEqual([95]);
    expect(overlay.endpoints).toBe(false);
  });
  it("matches independently counted signs for every planet in both directions", () => {
    const result = computeCouple(birth, other);
    for (const [visitor, owner] of [[result.a, result.b], [result.b, result.a]]) {
      const risingSign = Math.floor(owner.points.find((p) => p.id === "asc")!.lon / 30);
      for (const row of houseOverlay(visitor, owner).rows) {
        const planetSign = Math.floor(visitor.points.find((p) => p.id === row.planet)!.lon / 30);
        expect(row.whole).toEqual([(planetSign - risingSign + 12) % 12 + 1]);
      }
    }
    const [incoming, outgoing] = comparisonOverlays(result, "Alex");
    expect(incoming.rows).toEqual(houseOverlay(result.b, result.a).rows);
    expect(outgoing.rows).toEqual(houseOverlay(result.a, result.b).rows);
    expect(incoming.rows.map((r) => r.whole)).not.toEqual(outgoing.rows.map((r) => r.whole));
  });
  it("self-overlays reproduce the existing natal house assignments", () => {
    for (const row of houseOverlay(chart, chart).rows) {
      const natal = chart.points.find((p) => p.id === row.planet)!;
      expect(row.whole).toEqual([natal.houses!.whole]);
      expect(row.placidus).toEqual([natal.houses!.placidus]);
    }
  });
  it("omits only the direction with unknown receiving houses", () => {
    const unknown = computeChart({ ...other, time: null });
    expect(houseOverlay(chart, unknown)).toMatchObject({ available: false, rows: [] });
    const reverse = houseOverlay(unknown, chart);
    expect(reverse.available).toBe(true);
    expect(reverse.endpoints).toBe(true);
    expect(reverse.rows).toHaveLength(10);
    expect(reverse.rows.every((row) => row.whole.length === 2 && row.positions.length === 2)).toBe(true);
    expect(houseOverlay(unknown, unknown).available).toBe(false);
  });
  it("preserves endpoint order for retrograde crossings and does not collapse matching samples", () => {
    const unknown = computeChart({ ...other, time: null });
    const visitor = { ...unknown, points: unknown.points.map((p) => ({ ...p, range: { start: p.id === "mercury" ? 31 : 15, end: p.id === "mercury" ? 29 : 16 } })) };
    const owner = { ...chart, cusps: { ...chart.cusps!, whole: Array.from({ length: 12 }, (_, i) => i * 30) } };
    const overlay = houseOverlay(visitor, owner);
    expect(overlay.rows.find((r) => r.planet === "mercury")!.whole).toEqual([2, 1]);
    expect(overlay.rows[0].whole).toEqual([1, 1]);
    const directions = comparisonOverlays({ a: owner, b: visitor, contacts: [], allContacts: [] }, "Alex");
    expect(directions[0].notes).toContain(OVERLAY_ENDPOINTS);
  });
  it("keeps Placidus unavailable only for the polar house owner", () => {
    const polar = computeChart({ ...other, place: { label: "Tromsø", lat: 69.6492, lon: 18.9553, tz: "Europe/Oslo" } });
    expect(houseOverlay(chart, polar).rows.every((row) => row.placidus === null && row.whole.length === 1)).toBe(true);
    expect(houseOverlay(polar, chart).rows.every((row) => row.placidus?.length === 1)).toBe(true);
  });
  it("puts both directions and their exact uncertainty wording in the printable report", () => {
    const result = computeCouple(birth, { ...other, time: null });
    const report = buildReport(result.a, null, "placidus", { result, name: "Alex", relationship: "friend" });
    for (const direction of comparisonOverlays(result, "Alex")) {
      const section = report.sections.find((s) => s.title === direction.title)!;
      expect(section).toBeDefined();
      for (const paragraph of direction.paragraphs) expect(section.paragraphs).toContain(paragraph);
    }
  });
});
