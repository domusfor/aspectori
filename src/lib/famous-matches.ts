import type { FamousSummary } from "./famous-summary";
import type { BirthInput, Chart } from "./astro/types";
import { signsOf } from "./astro/reading";

export interface MatchReason { point: "Sun" | "Moon" | "Rising"; sign: string; certain: boolean }
export interface FamousMatch { person: FamousSummary; reasons: MatchReason[]; birth: BirthInput }
export interface FamousMatches { matches: FamousMatch[]; compared: number }

/** Similar placements are a discovery aid, not a romantic-compatibility score. */
export function rankFamousMatches(chart: Chart, people: FamousSummary[], limit = 6) {
  const own = chart.points;
  const points = [["Sun", "sun", "sun"], ["Moon", "moon", "moon"], ["Rising", "asc", "rising"]] as const;
  return people.map((person) => {
    const reasons: MatchReason[] = [];
    for (const [label, id, key] of points) {
      const point = own.find((p) => p.id === id);
      if (!point) continue;
      const ours = signsOf(point);
      const theirs = key === "rising" ? (person.rising ? [person.rising] : []) : person[key];
      for (const sign of ours.filter((s) => theirs.includes(s))) {
        reasons.push({ point: label, sign, certain: ours.length === 1 && theirs.length === 1 });
      }
    }
    const certain = reasons.filter((r) => r.certain).length;
    const possible = new Set(reasons.filter((r) => !r.certain).map((r) => r.point)).size;
    return { person, reasons, certain, possible };
  }).filter((match) => match.reasons.length)
    .sort((a, b) => b.certain - a.certain || b.possible - a.possible || b.person.popularity - a.person.popularity || a.person.slug.localeCompare(b.person.slug))
    .slice(0, limit).map(({ person, reasons }) => ({ person, reasons }));
}
