import type { WeekTransit } from "./types";
import type { BodyId, PointId } from "./zodiac";

export const WEEK_TOPICS = {
  communication: { label: "Communication", color: "#a9c5dd", title: "Make room for a clearer conversation", prompt: "Which conversation would benefit from one good question before you explain your own view?" },
  connection: { label: "Relationships", color: "#d4b5c9", title: "Notice how you connect", prompt: "What small expression of appreciation would actually feel meaningful to someone you care about?" },
  personal: { label: "Personal priorities", color: "#e2c58d", title: "Return to what matters to you", prompt: "Which priority deserves a little more room this week, and what can you set aside to make that possible?" },
  growth: { label: "Support & growth", color: "#b4cbb1", title: "Choose a manageable next step", prompt: "What is one realistic commitment you can make without promising more than you can sustain?" },
} as const;
export type WeekTopic = keyof typeof WEEK_TOPICS;
export function weekTopic(target: PointId): WeekTopic {
  if (target === "mercury") return "communication";
  if (target === "venus" || target === "mars") return "connection";
  if (target === "sun" || target === "moon" || target === "asc") return "personal";
  return "growth";
}
const PLANET_LENS: Record<BodyId, string> = {
  sun: "focus and self-expression", moon: "changing feelings and everyday rhythms", mercury: "words, learning and attention",
  venus: "appreciation, enjoyment and values", mars: "initiative, effort and boundaries", jupiter: "possibility and perspective",
  saturn: "responsibility and sustainable limits", uranus: "independence and experimentation", neptune: "imagination and assumptions",
  pluto: "intensity and the wish for control", node: "direction", chiron: "sensitivity",
};
const TARGET_LENS: Record<PointId, string> = {
  sun: "your priorities and sense of identity", moon: "your familiar ways of finding reassurance", mercury: "how you think and communicate",
  venus: "what you appreciate and how you express care", mars: "how you act and assert your needs", jupiter: "your beliefs and appetite for growth",
  saturn: "your commitments and boundaries", asc: "your approach to new situations", mc: "your public direction and responsibilities",
  uranus: "your relationship with change", neptune: "your ideals", pluto: "your relationship with intensity", node: "your direction", chiron: "your sensitivities",
};
const ASPECT_LENS = {
  conjunction: "The conjunction is traditionally read as an emphasis on both themes. Notice where they overlap in your experience.",
  sextile: "A sextile is traditionally read as an opportunity for cooperation. Choose a small action rather than waiting for something to happen.",
  trine: "A trine is traditionally associated with ease. Consider which helpful resources or habits you might otherwise overlook.",
  square: "A square is traditionally associated with competing approaches. Identify the trade-off and choose a response you can influence.",
  opposition: "An opposition is traditionally read as a contrast. Make room for another perspective without abandoning your own needs.",
} as const;

export function weekReading(transit: WeekTransit) {
  const topic = weekTopic(transit.target);
  return {
    ...WEEK_TOPICS[topic], topic,
    interpretation: `In astrological tradition, this brings themes of ${PLANET_LENS[transit.planet]} into a reading of ${TARGET_LENS[transit.target]}.`,
    aspect: ASPECT_LENS[transit.type],
  };
}
