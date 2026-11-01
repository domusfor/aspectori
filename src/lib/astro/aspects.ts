import { norm, SLOW, type PointId } from "./zodiac";

export type AspectType = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export const ASPECTS: { type: AspectType; angle: number; orb: number; verb: string; verb3: string; symbol: string }[] = [
  { type: "conjunction", angle: 0, orb: 8, verb: "conjunct", verb3: "conjoins", symbol: "☌" },
  { type: "sextile", angle: 60, orb: 5, verb: "sextile", verb3: "sextiles", symbol: "⚹" },
  { type: "square", angle: 90, orb: 7, verb: "square", verb3: "squares", symbol: "□" },
  { type: "trine", angle: 120, orb: 7, verb: "trine", verb3: "trines", symbol: "△" },
  { type: "opposition", angle: 180, orb: 8, verb: "opposite", verb3: "opposes", symbol: "☍" },
];
export const ASPECT_BY_TYPE = Object.fromEntries(ASPECTS.map((a) => [a.type, a])) as Record<AspectType, (typeof ASPECTS)[number]>;

export type Positions = Partial<Record<PointId, number>>;

export interface Aspect {
  a: PointId;
  b: PointId;
  type: AspectType;
  /** Worst-case orb across all samples (equals the exact orb when birth time is known). */
  orb: number;
  /** Best-case orb across samples. 0 if the aspect perfected during the window. */
  minOrb: number;
}

/** Separation 0..180 */
export function separation(x: number, y: number) {
  const d = Math.abs(norm(x) - norm(y));
  return d > 180 ? 360 - d : d;
}

function signedOff(x: number, y: number, angle: number) {
  return separation(x, y) - angle;
}

export function findAspect(x: number, y: number, orbScale = 1) {
  const sep = separation(x, y);
  for (const asp of ASPECTS) {
    const off = Math.abs(sep - asp.angle);
    if (off <= asp.orb * orbScale) return { type: asp.type, orb: off };
  }
  return null;
}

interface PairOpts {
  /** Skip pairs where both points are generational (e.g. Uranus–Pluto). */
  skipSlowPairs?: boolean;
  orbScale?: number;
  sameChart?: boolean;
}

/**
 * Aspects that hold across *every* sample. With a known birth time there is one sample.
 * With an unknown time we pass the start and end of the birth day; an aspect is reported
 * only if it exists, with the same type, at both ends. Stations and changing relative
 * speeds can place extrema between samples; this is not a continuous-day guarantee.
 *
 * `samples` is a list of [chartA, chartB] position pairs. For a single natal chart A === B.
 */
export function stableAspects(samples: [Positions, Positions][], opts: PairOpts = {}): Aspect[] {
  const out: Aspect[] = [];
  const [first] = samples;
  const keysA = Object.keys(first[0]) as PointId[];
  const keysB = Object.keys(first[1]) as PointId[];
  const seen = new Set<string>();
  for (const a of keysA) {
    for (const b of keysB) {
      if (opts.sameChart) {
        if (a === b) continue;
        const k = [a, b].sort().join("|");
        if (seen.has(k)) continue;
        seen.add(k);
        if ((a === "asc" && b === "mc") || (a === "mc" && b === "asc")) continue;
      }
      if (opts.skipSlowPairs && SLOW.has(a) && SLOW.has(b)) continue;

      let type: AspectType | null = null;
      let worst = 0;
      const offs: number[] = [];
      let ok = true;
      for (const [pa, pb] of samples) {
        const x = pa[a], y = pb[b];
        if (x === undefined || y === undefined) { ok = false; break; }
        const hit = findAspect(x, y, opts.orbScale);
        if (!hit || (type && hit.type !== type)) { ok = false; break; }
        type = hit.type;
        worst = Math.max(worst, hit.orb);
        offs.push(signedOff(x, y, ASPECT_BY_TYPE[hit.type].angle));
      }
      if (!ok || !type) continue;
      const crossed = offs.some((o) => o > 0) && offs.some((o) => o < 0);
      const minOrb = crossed ? 0 : Math.min(...offs.map(Math.abs));
      out.push({ a, b, type, orb: worst, minOrb });
    }
  }
  return out.sort((p, q) => p.orb - q.orb);
}

export const isEasy = (asp: Aspect) => {
  if (asp.type === "trine" || asp.type === "sextile") return true;
  if (asp.type === "square" || asp.type === "opposition") return false;
  // Conjunctions take on the nature of what is involved.
  const hard: PointId[] = ["saturn", "mars", "pluto", "uranus"];
  return !(hard.includes(asp.a) || hard.includes(asp.b));
};
