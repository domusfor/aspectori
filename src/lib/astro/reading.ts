// Assembles the card and the "why this sentence" rows from a computed chart.
import type { Aspect } from "./aspects";
import { aspectOrbLabel, aspectSentence, aspectTitle, houseSentence, placementSentence } from "./library";
import type { Chart, HouseSystem, PointRow } from "./types";
import { ALL_BODY_IDS, fmtPos, ordinal, POINT_GLYPHS, POINT_NAMES, signOf, SLOW, type PointId, type Sign } from "./zodiac";

export interface Evidence {
  glyph: string;
  label: string;
  position: string;
  house?: string;
  note?: string;
}

export interface Entry {
  ref: string;
  title: string;
  lines: string[];
  evidence: Evidence[];
}

export const aspectRef = (a: Pick<Aspect, "a" | "b">) => `asp-${a.a}-${a.b}`;

export function pointMap(chart: Chart) {
  return Object.fromEntries(chart.points.map((p) => [p.id, p])) as Record<PointId, PointRow>;
}

/** Sign(s) a point occupied. Two entries if it changed sign during an unknown-time day. */
export function signsOf(p: PointRow): Sign[] {
  if (!p.range) return [signOf(p.lon)];
  const a = signOf(p.range.start), b = signOf(p.range.end);
  return a === b ? [a] : [a, b];
}

export function positionLabel(p: PointRow) {
  if (!p.range) return fmtPos(p.lon) + (p.retro ? " ℞" : "");
  return `${fmtPos(p.range.start)} → ${fmtPos(p.range.end)}`;
}

export function houseLabel(p: PointRow, sys: HouseSystem) {
  if (!p.houses) return undefined;
  const h = sys === "placidus" ? p.houses.placidus : p.houses.whole;
  if (h === null) return undefined;
  return `${ordinal(h)} house · ${sys === "placidus" ? "Placidus" : "whole sign"}`;
}

/** The tightest aspect that is personal to this chart (not shared by a whole generation). */
export function signatureAspect(chart: Chart): Aspect | undefined {
  return chart.aspects.find((a) => !(SLOW.has(a.a) && SLOW.has(a.b)));
}

function evidenceFor(p: PointRow, sys: HouseSystem): Evidence {
  return {
    glyph: POINT_GLYPHS[p.id],
    label: POINT_NAMES[p.id],
    position: positionLabel(p),
    house: houseLabel(p, sys),
    note: p.range?.ingressLocal ? `changed sign at ${p.range.ingressLocal} local time` : undefined,
  };
}

function placementEntry(p: PointRow, sys: HouseSystem): Entry {
  const signs = signsOf(p);
  const lines =
    signs.length === 1
      ? [placementSentence(p.id, signs[0])]
      : [
          `Born before ${p.range!.ingressLocal}: ${placementSentence(p.id, signs[0])}`,
          `Born after: ${placementSentence(p.id, signs[1])}`,
        ];
  const h = p.houses && (sys === "placidus" ? p.houses.placidus : p.houses.whole);
  if (h && p.id !== "asc" && p.id !== "mc") lines.push(houseSentence(p.id, h));
  const name = p.id === "asc" ? "Rising" : POINT_NAMES[p.id];
  return {
    ref: p.id,
    title: p.id === "asc" ? `${signs[0]} Rising` : `${signs.join(" or ")} ${name}`,
    lines,
    evidence: [evidenceFor(p, sys)],
  };
}

function aspectEntry(asp: Aspect, chart: Chart, sys: HouseSystem): Entry {
  const pts = pointMap(chart);
  return {
    ref: aspectRef(asp),
    title: `${aspectTitle(asp)}, ${aspectOrbLabel(asp, chart.timeKnown)}`,
    lines: [aspectSentence(asp)],
    evidence: [evidenceFor(pts[asp.a], sys), evidenceFor(pts[asp.b], sys)],
  };
}

/** Resolve any plotted point or aspect, independently of the abbreviated reading list. */
export function readingEntry(chart: Chart, sys: HouseSystem, ref: string): Entry | null {
  const point = chart.points.find((p) => p.id === ref);
  if (point) return placementEntry(point, sys);
  const aspect = chart.aspects.find((a) => aspectRef(a) === ref);
  return aspect ? aspectEntry(aspect, chart, sys) : null;
}

export function buildReading(chart: Chart, sys: HouseSystem) {
  const pts = pointMap(chart);
  const sig = signatureAspect(chart);
  const lead: Entry[] = [placementEntry(pts.sun, sys), placementEntry(pts.moon, sys)];
  if (pts.asc) lead.push(placementEntry(pts.asc, sys));
  if (sig) lead.push(aspectEntry(sig, chart, sys));

  const rest: Entry[] = ALL_BODY_IDS.slice(2).map((id) => placementEntry(pts[id], sys));
  const more = chart.aspects
    .filter((a) => a !== sig && !(SLOW.has(a.a) && SLOW.has(a.b)))
    .slice(0, 5)
    .map((a) => aspectEntry(a, chart, sys));
  return { sig, lead, rest: [...rest, ...more] };
}
