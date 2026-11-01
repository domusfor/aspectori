import { DateTime } from "luxon";
import type { Chart } from "./types";
import { SIGNS, signIndex, type PlanetId } from "./zodiac";

/** Traditional domicile rulers, in zodiac order. Profections always use this scheme. */
export const TRADITIONAL_RULERS: readonly PlanetId[] = ["mars", "venus", "mercury", "moon", "sun", "mercury", "venus", "mars", "jupiter", "saturn", "saturn", "jupiter"];
export const MODERN_RULERS: readonly PlanetId[] = TRADITIONAL_RULERS.map((ruler, index) => index === 7 ? "pluto" : index === 10 ? "uranus" : index === 11 ? "neptune" : ruler);

export function chartRulers(chart: Chart) {
  const asc = chart.timeKnown ? chart.points.find((p) => p.id === "asc") : undefined;
  if (!asc) return null;
  const index = signIndex(asc.lon);
  return { sign: SIGNS[index], asc, traditional: chart.points.find((p) => p.id === TRADITIONAL_RULERS[index])!, modern: chart.points.find((p) => p.id === MODERN_RULERS[index])! };
}

export const HOUSE_TOPICS = [
  ["Identity & direction", "What would help you act in a way that feels more like you?"],
  ["Resources & values", "Which resources do you want to use more deliberately?"],
  ["Learning & everyday connections", "What would you like to learn or communicate more clearly?"],
  ["Home & foundations", "What makes a place feel supportive to you?"],
  ["Creativity & enjoyment", "What would you make time for simply because you enjoy it?"],
  ["Routines & responsibilities", "Which everyday habit would make your responsibilities more manageable?"],
  ["Partnerships & agreements", "Which expectations would benefit from an honest conversation?"],
  ["Shared resources & trust", "Where would clearer agreements make sharing easier?"],
  ["Perspective & exploration", "What unfamiliar perspective are you curious to explore?"],
  ["Work & public contribution", "What kind of contribution would feel worthwhile to you?"],
  ["Friendships & community", "Which connection or shared project would you like to nurture?"],
  ["Rest & private reflection", "Where could you make a little more room for quiet?"],
] as const;

/** Calendar convention: February 29 birthdays use February 28 in non-leap years. */
export function completedAge(birthDate: string, asOf = DateTime.utc().toISODate()!) {
  const birth = DateTime.fromISO(birthDate, { zone: "UTC" });
  const date = DateTime.fromISO(asOf, { zone: "UTC" });
  if (!birth.isValid || !date.isValid || date < birth) return null;
  let age = date.year - birth.year;
  if (date < birth.plus({ years: age })) age--;
  return age;
}

export function annualProfection(chart: Chart, age: number) {
  if (!Number.isInteger(age) || age < 0 || age > 120) throw new RangeError("Choose a whole-number age from 0 to 120.");
  const house = age % 12 + 1;
  const rulers = chartRulers(chart);
  const index = rulers ? (signIndex(rulers.asc.lon) + house - 1) % 12 : null;
  const birth = DateTime.fromISO(chart.input.date, { zone: "UTC" });
  const ruler = index === null ? null : TRADITIONAL_RULERS[index];
  return {
    age, house, sign: index === null ? null : SIGNS[index], ruler,
    rulerPoint: ruler ? chart.points.find((point) => point.id === ruler)! : null,
    from: birth.plus({ years: age }).toISODate()!, until: birth.plus({ years: age + 1 }).toISODate()!,
    topic: HOUSE_TOPICS[house - 1][0], prompt: HOUSE_TOPICS[house - 1][1],
  };
}
