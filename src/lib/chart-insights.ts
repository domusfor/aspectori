import type { Chart } from "./astro/types";
import { BODY_IDS, SIGNS, type PointId } from "./astro/zodiac";
import { signsOf } from "./astro/reading";

export const ELEMENTS = [
  { name: "Fire", color: "#b56a43", theme: "Initiative · expression" },
  { name: "Earth", color: "#6a8061", theme: "Practicality · continuity" },
  { name: "Air", color: "#6387a2", theme: "Ideas · exchange" },
  { name: "Water", color: "#88749a", theme: "Feeling · imagination" },
] as const;

/** Equal-count planetary sign distribution; never a personality percentage. */
export function elementBalance(chart: Chart) {
  const counts = [0, 0, 0, 0];
  let uncertain = 0;
  for (const id of BODY_IDS) {
    const point = chart.points.find((p) => p.id === id);
    if (!point) continue;
    const signs = signsOf(point);
    if (signs.length > 1) { uncertain++; continue; }
    counts[SIGNS.indexOf(signs[0]) % 4]++;
  }
  return { elements: ELEMENTS.map((element, i) => ({ ...element, count: counts[i] })), uncertain, counted: counts.reduce((a, b) => a + b, 0) };
}

export const REFLECTIONS: Record<PointId, string> = {
  sun: "Where do you feel most able to express what matters to you, without performing for someone else?",
  moon: "What reliably helps you feel settled, and how do you recognize when you need it?",
  asc: "How does your first response to a new situation differ from how you feel once you are comfortable?",
  mercury: "When does your communication work best: thinking aloud, writing first, or taking time before replying?",
  venus: "How do you show appreciation, and which expressions of care do you tend to overlook?",
  mars: "What helps you turn an intention into action while respecting your own limits and those of others?",
  jupiter: "Which opportunity would broaden your perspective, and what would make it realistic?",
  saturn: "Which responsibility supports your values, and which expectation needs a clearer boundary?",
  uranus: "Where would a small experiment bring useful freedom without abandoning something valuable?",
  neptune: "Which hope inspires you, and what evidence would help you distinguish it from an assumption?",
  pluto: "Where can you choose openness rather than trying to control an uncertain outcome?",
  node: "Which direction feels worth exploring through real choices rather than treating it as predetermined?",
  chiron: "What experience has made you more considerate of another person’s vulnerability?",
  mc: "How would you define meaningful contribution without relying only on status or recognition?",
};

export const REPORT_GLOSSARY = [
  ["Sign", "A 30-degree division of the tropical zodiac. In interpretation it describes a symbolic style."],
  ["House", "An area of the chart assigned from time and place. A different house system can change the house number without changing a planet’s sign."],
  ["Aspect", "An angular relationship between two chart points. We show the major aspects within explicitly defined limits."],
  ["Orb", "The distance from an exact aspect angle. A tighter orb is a closer geometry, not evidence that a prediction is more certain."],
  ["Retrograde", "Apparent backward motion in geocentric longitude. It is not a planet physically reversing its orbit."],
  ["Transit", "A current or future planetary position compared with the natal chart. Dates describe the alignment, not a guaranteed event."],
] as const;
