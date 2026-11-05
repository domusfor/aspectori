// Astro.com reference charts (Astro-Databank) and the helpers to read their notation.
import data from "@/data/astrocom-reference.json";
import { SIGNS } from "./zodiac";

export type Reference = (typeof data.charts)[number];
export const REFERENCE: Reference[] = data.charts;

/** "48n24 10e0" → { lat, lon } */
export function coords(s: string) {
  const [la, lo] = s.split(" ");
  const p = (v: string, pos: string) => {
    const m = /^(\d+)([nsew])(\d{0,2})(\d{0,2})$/.exec(v)!;
    const x = Number(m[1]) + Number(m[3] || 0) / 60 + Number(m[4] || 0) / 3600;
    return m[2] === pos ? x : -x;
  };
  return { lat: p(la, "n"), lon: p(lo, "e") };
}

/** Astro.com zone codes → minutes east. "h5w" = 5 h west; "m10e0" = mean time at 10°00′ E; "m7e2630" = 7°26′30″ E. */
export function adbOffset(zone: string) {
  const h = /h(\d+)([ew])(\d*)/.exec(zone);
  if (h) return (Number(h[1]) * 60 + Number(h[3] || 0)) * (h[2] === "e" ? 1 : -1);
  const m = /m(\d+)([ew])(\d{0,2})(\d{0,2})/.exec(zone)!;
  const deg = Number(m[1]) + Number(m[3] || 0) / 60 + Number(m[4] || 0) / 3600;
  return deg * 4 * (m[2] === "e" ? 1 : -1);
}

/** "23°30' Pis" → absolute longitude in arcminutes */
export function arcmin(s: string) {
  const m = /^(\d+)°(\d+)'?\s+(\w{3})$/.exec(s)!;
  const sign = SIGNS.findIndex((x) => x.slice(0, 3) === m[3]);
  return sign * 1800 + Number(m[1]) * 60 + Number(m[2]);
}

/** Difference in arcminutes after rounding ours the way Astro.com prints it. */
export function delta(lon: number, expected: string) {
  let d = Math.round(lon * 60) - arcmin(expected);
  if (d > 10800) d -= 21600;
  if (d < -10800) d += 21600;
  return d;
}

export const referenceInput = (f: Reference, offset?: number) => ({
  date: f.date,
  time: f.time,
  offset,
  place: { label: f.place, ...coords(f.coords), tz: f.tz },
});
