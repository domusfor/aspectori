import type { Chart, CoupleResult } from "./types";
import { BODY_IDS, fmtPos, norm, POINT_NAMES, type PlanetId } from "./zodiac";

/** Ecliptic-longitude sectors: a cusp belongs to the house beginning there. */
export function houseOf(lon: number, cusps: number[]) {
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const span = norm(cusps[(i + 1) % 12] - start);
    if (norm(lon - start) < span) return i + 1;
  }
  return 12;
}

export interface OverlayRow {
  planet: PlanetId;
  positions: number[];
  whole: number[];
  placidus: number[] | null;
}

export const OVERLAY_METHOD = "Each person's planets are placed in the other person's house sectors by ecliptic longitude. A planet exactly on a cusp belongs to the house beginning there. Whole sign and Placidus are shown separately; no cusp orb or latitude correction is applied. These are symbolic areas of life, not a compatibility score.";
export const OVERLAY_ENDPOINTS = "The planet owner's birth time is unknown. Each pair shows the start and end of their local birth day, in that order. Even matching house numbers describe only those two samples, not every moment between them. No full-day house assignment is claimed.";

/** Owner supplies the houses; visitor supplies only planetary longitudes. */
export function houseOverlay(visitor: Chart, owner: Chart) {
  if (!owner.timeKnown || !owner.cusps) return { available: false, endpoints: !visitor.timeKnown, rows: [] as OverlayRow[] };
  const cusps = owner.cusps;
  const rows: OverlayRow[] = BODY_IDS.flatMap((planet) => {
    const point = visitor.points.find((p) => p.id === planet);
    if (!point || (!visitor.timeKnown && !point.range)) return [];
    const positions = visitor.timeKnown ? [point.lon] : [point.range!.start, point.range!.end];
    return [{ planet, positions, whole: positions.map((lon) => houseOf(lon, cusps.whole)),
      placidus: cusps.placidus ? positions.map((lon) => houseOf(lon, cusps.placidus!)) : null }];
  });
  return { available: true, endpoints: !visitor.timeKnown, rows };
}

export const overlayHouses = (houses: number[] | null) => houses ? houses.join(" → ") : "Unavailable";

/** Shared by screen, print and PDF so direction and uncertainty stay consistent. */
export function comparisonOverlays(result: CoupleResult, name: string) {
  return [
    { title: `${name}’s planets in your houses`, visitor: result.b, owner: result.a, missing: "Your birth time is needed to locate your houses." },
    { title: `Your planets in ${name}’s houses`, visitor: result.a, owner: result.b, missing: `${name}’s birth time is needed to locate their houses.` },
  ].map(({ title, visitor, owner, missing }) => {
    const overlay = houseOverlay(visitor, owner);
    const notes = !overlay.available ? [missing] : [
      overlay.endpoints ? OVERLAY_ENDPOINTS : "Planet positions and house cusps use the supplied birth times. An approximate time can change assignments, especially near a cusp.",
      ...(!owner.cusps?.placidus ? ["Placidus is unavailable for this house owner's birthplace. Whole sign remains available; no replacement system is shown as Placidus."] : []),
    ];
    return { title, ...overlay, cusps: owner.timeKnown ? owner.cusps : undefined, notes, paragraphs: [
      ...notes,
      ...overlay.rows.map((row) => `${POINT_NAMES[row.planet]}: ${row.positions.map(fmtPos).join(" → ")} · Whole sign house ${overlayHouses(row.whole)} · Placidus ${row.placidus ? `house ${overlayHouses(row.placidus)}` : "unavailable"}${overlay.endpoints ? " · Day endpoints only" : ""}.`),
    ] };
  });
}
