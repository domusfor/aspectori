import { ASPECT_BY_TYPE, separation } from "./astro/aspects";
import { aspectRef, readingEntry } from "./astro/reading";
import type { Chart, HouseSystem } from "./astro/types";
import { fmtOrb, POINT_NAMES, type PointId } from "./astro/zodiac";
import { REFLECTIONS } from "./chart-insights";

export const POINT_THEMES: Record<PointId, string> = {
  sun: "The Sun is read as a symbol of identity, purpose and self-expression.",
  moon: "The Moon is read as a symbol of emotional needs, familiar habits and comfort.",
  asc: "The Rising sign marks the eastern horizon at birth. In interpretation, it describes an initial approach to situations.",
  mercury: "Mercury is read as a symbol of thinking, learning and communication.",
  venus: "Venus is read as a symbol of appreciation, connection and what feels worthwhile.",
  mars: "Mars is read as a symbol of initiative, assertion and the way effort is directed.",
  jupiter: "Jupiter is read as a symbol of growth, perspective and the search for meaning.",
  saturn: "Saturn is read as a symbol of responsibility, limits and sustained effort.",
  uranus: "Uranus is read as a symbol of independence, experimentation and change.",
  neptune: "Neptune is read as a symbol of imagination, ideals and blurred boundaries.",
  pluto: "Pluto is read as a symbol of intensity, power and deep change.",
  node: "The North Node is an orbital intersection, not a planet. It is interpreted as a symbolic direction for growth.",
  chiron: "Chiron is a minor body. In modern astrology, it is used as a symbol for vulnerability and learning through experience.",
  mc: "The Midheaven marks the upper meridian's intersection with the ecliptic. It is interpreted in relation to public life and contribution.",
};

export function explainChartRef(chart: Chart, requested: HouseSystem, ref: string) {
  const system = requested === "placidus" && !chart.cusps?.placidus ? "whole" : requested;
  const entry = readingEntry(chart, system, ref);
  if (!entry) return null;
  const point = chart.points.find((p) => p.id === ref);
  const aspect = chart.aspects.find((a) => aspectRef(a) === ref);
  const geometry = aspect ? (() => {
    const rule = ASPECT_BY_TYPE[aspect.type];
    if (!chart.timeKnown) return `This ${aspect.type} is within our ${rule.orb}° orb limit at both the start and end of your birth day. The orb shown is based on those two checks, so it may not hold at every moment of the day.`;
    const a = chart.points.find((p) => p.id === aspect.a)!;
    const b = chart.points.find((p) => p.id === aspect.b)!;
    return `The shorter angle between ${POINT_NAMES[a.id]} and ${POINT_NAMES[b.id]} is ${fmtOrb(separation(a.lon, b.lon))}. A ${rule.type} is exact at ${rule.angle}°. This contact is ${fmtOrb(aspect.orb)} from exact, within our ${rule.orb}° limit.`;
  })() : null;
  return {
    entry, system, kind: point ? "placement" as const : "aspect" as const,
    theme: point ? POINT_THEMES[point.id] : "An aspect connects two chart themes through their angular relationship. A tighter orb means closer geometry, not a more certain life outcome.",
    geometry,
    prompt: point ? REFLECTIONS[point.id] : `Where do the themes of ${POINT_NAMES[aspect!.a]} and ${POINT_NAMES[aspect!.b]} support each other in your experience, and where do they ask for different things?`,
    uncertainty: !chart.timeKnown ? "Birth time is unknown, so positions use the start and end of your birth day. A brief sign change between them cannot be ruled out. Rising and houses are unavailable." : null,
  };
}
