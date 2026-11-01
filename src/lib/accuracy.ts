import "server-only";
import { cacheLife } from "next/cache";
import { computeChart } from "./astro/engine";
import { adbOffset, coords, delta, REFERENCE, referenceInput } from "./astro/reference";
import { resolveMoment } from "./astro/time";
import { fmtPos } from "./astro/zodiac";

export interface AccuracyRow {
  name: string;
  date: string;
  place: string;
  rr: string;
  points: { label: string; astrocom: string; ours: string; diff: number }[];
  tzMatches: boolean;
}

const SIGN_FULL: Record<string, string> = {
  Ari: "Aries", Tau: "Taurus", Gem: "Gemini", Can: "Cancer", Leo: "Leo", Vir: "Virgo",
  Lib: "Libra", Sco: "Scorpio", Sag: "Sagittarius", Cap: "Capricorn", Aqu: "Aquarius", Pis: "Pisces",
};
const pretty = (s: string) => {
  const m = /^(\d+)°(\d+)'?\s+(\w{3})$/.exec(s)!;
  return `${Number(m[1])}°${m[2]}′ ${SIGN_FULL[m[3]]}`;
};

/** Every reference chart, recomputed: the same check the test suite runs before each release. */
export async function accuracyReport(): Promise<AccuracyRow[]> {
  "use cache";
  cacheLife("max");
  return REFERENCE.map((f) => {
    const chart = computeChart(referenceInput(f, adbOffset(f.adbZone)));
    const pos = Object.fromEntries(chart.points.map((p) => [p.id, p.lon]));
    const ours = resolveMoment(f.date, f.time, { tz: f.tz, lon: coords(f.coords).lon }).offset;
    return {
      name: f.name, date: f.date, place: f.place, rr: f.rr,
      points: ([["Sun", "sun"], ["Moon", "moon"], ["Ascendant", "asc"]] as const).map(([label, id]) => ({
        label, astrocom: pretty(f[id]), ours: fmtPos(pos[id]), diff: delta(pos[id], f[id]),
      })),
      tzMatches: Math.abs(ours - adbOffset(f.adbZone)) * 60 < 30,
    };
  });
}
