import "server-only";
import { cacheLife } from "next/cache";
import type { Famous } from "@/data/famous";
import { ALL_FAMOUS, famousBySlug } from "@/data/people";
import precomputed from "@/data/people-summary.json";
import { computeChart } from "./astro/engine";
import { aspectOrbLabel, aspectTitle } from "./astro/library";
import { pointMap, signatureAspect, signsOf } from "./astro/reading";
import { signOf, type Sign } from "./astro/zodiac";

export interface FamousSummary {
  slug: string;
  name: string;
  blurb: string;
  category: Famous["category"];
  rating: Famous["rating"];
  year: string;
  popularity: number;
  /** Two signs when the body changed sign on a date-only chart. */
  sun: Sign[];
  moon: Sign[];
  rising: Sign | null;
  signature: string | null;
}

export function summarize(f: Famous): FamousSummary {
  const chart = computeChart(f.birth);
  const p = pointMap(chart);
  const sig = signatureAspect(chart);
  return {
    slug: f.slug, name: f.name, blurb: f.blurb, category: f.category, rating: f.rating, popularity: f.popularity,
    year: f.birth.date.slice(0, 4),
    sun: signsOf(p.sun), moon: signsOf(p.moon), rising: p.asc ? signOf(p.asc.lon) : null,
    signature: sig ? `${aspectTitle(sig)}, ${aspectOrbLabel(sig, chart.timeKnown)}` : null,
  };
}

// Famous charts are fixed facts: compute once and cache (the date library reads the clock internally).
export async function famousChart(slug: string) {
  "use cache";
  cacheLife("max");
  const f = famousBySlug(slug);
  return f ? computeChart(f.birth) : null;
}

const PRE = new Map((precomputed as [string, string, string, string][]).map(([slug, sun, moon, sig]) => [slug, { sun, moon, sig }]));

/**
 * Every famous chart, summarized, most widely known first. Date-only charts come from
 * people-summary.json (built by scripts/build-summaries.ts); curated ones are computed.
 */
export async function allSummaries(): Promise<FamousSummary[]> {
  "use cache";
  cacheLife("max");
  return ALL_FAMOUS.map((f) => {
    const pre = PRE.get(f.slug);
    if (!pre || f.rating !== "X") return summarize(f);
    return {
      slug: f.slug, name: f.name, blurb: f.blurb, category: f.category, rating: f.rating, popularity: f.popularity,
      year: f.birth.date.slice(0, 4),
      sun: pre.sun.split("/") as Sign[], moon: pre.moon.split("/") as Sign[], rising: null, signature: pre.sig || null,
    };
  });
}

export async function famousSummary(slug: string) {
  "use cache";
  cacheLife("max");
  const f = famousBySlug(slug);
  return f ? summarize(f) : null;
}

/** "Pisces Sun, Sagittarius Moon, Cancer Rising" */
export function headline(s: FamousSummary) {
  const parts = [`${s.sun.join(" or ")} Sun`, `${s.moon.join(" or ")} Moon`];
  if (s.rising) parts.push(`${s.rising} Rising`);
  return parts.join(", ");
}
