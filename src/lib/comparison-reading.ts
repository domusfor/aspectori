import type { Contact } from "./astro/types";
import { ASPECT_BY_TYPE } from "./astro/aspects";
import { POINT_NAMES, type PointId } from "./astro/zodiac";

export const RELATIONSHIPS = ["partner", "friend", "family", "other", "famous"] as const;
export type Relationship = typeof RELATIONSHIPS[number];
export const relationshipOf = (value: string | null): Relationship => RELATIONSHIPS.includes(value as Relationship) ? value as Relationship : "other";
export const TOPICS = {
  communication: { label: "Communication", description: "How ideas, words and listening meet." },
  emotional: { label: "Emotional rhythms", description: "Comfort, reassurance and personal needs." },
  connection: { label: "Connection & energy", description: "Appreciation, initiative and shared enjoyment." },
  growth: { label: "Support & growth", description: "Commitment, independence and changing perspectives." },
} as const;
export type ContactTopic = keyof typeof TOPICS;

const DOMAIN: Record<PointId, string> = {
  sun: "identity and self-expression", moon: "emotional habits and reassurance", mercury: "communication and thinking",
  venus: "affection and values", mars: "initiative and assertiveness", jupiter: "encouragement and perspective",
  saturn: "responsibility and boundaries", uranus: "independence and novelty", neptune: "imagination and expectations",
  pluto: "intensity and control", asc: "first impressions and approach", mc: "public direction", node: "direction", chiron: "sensitivity",
};
const PAIRS: Record<string, string> = {
  "moon|sun": "One person’s self-expression meets the other’s need for emotional familiarity. Notice whether feeling understood and being yourself happen together.",
  "moon|moon": "Your emotional habits are in focus: how each of you seeks comfort, responds to change and recovers after a demanding day.",
  "mercury|moon": "Words meet feelings. An explanation can feel supportive to one person while the other is looking for acknowledgment before advice.",
  "mercury|mercury": "The focus is how you exchange information: pace, detail, humor, questions and the time each person needs to think.",
  "mercury|saturn": "Communication meets standards and responsibility. Useful structure can help a conversation, while correction can feel discouraging if encouragement is missing.",
  "mars|mercury": "Ideas meet the impulse to act. This is a useful prompt to explore debate, interruption and how quickly discussion becomes a decision.",
  "moon|venus": "Emotional comfort meets the way appreciation is expressed. What feels kind or generous to one person may differ from what reassures the other.",
  "mars|venus": "Enjoyment and affection meet initiative. Explore differences in pace, invitations and preferences; the chart cannot establish attraction or consent.",
  "mars|mars": "Two styles of taking action come into focus. Consider how you cooperate on a task, share initiative and handle disagreement.",
  "saturn|sun": "Self-expression meets expectations and responsibility. Explore the difference between reliable support and feeling evaluated.",
  "moon|saturn": "Emotional needs meet boundaries and duty. Consistency may feel reassuring, but practical help and emotional acknowledgment are not interchangeable.",
  "jupiter|sun": "Self-expression meets encouragement and a wider perspective. Notice whether optimism makes room for realistic limits and individual goals.",
  "sun|sun": "Your ways of expressing identity are in focus. Similar priorities can be recognizable, but shared signs alone do not establish shared values.",
  "venus|venus": "Ways of showing appreciation and choosing what feels worthwhile come into focus: tastes, kindness, spending and shared enjoyment.",
};
const GEOMETRY = {
  conjunction: "Astrologers read a conjunction as emphasis and overlap. Similarity can feel familiar or crowded; neither outcome is guaranteed.",
  sextile: "A sextile is traditionally read as an opening for cooperation. Treat it as something to explore through action, rather than an automatic benefit.",
  trine: "A trine is traditionally associated with ease and familiarity. Ease can still leave important needs unspoken.",
  square: "A square is traditionally associated with friction between different approaches. It suggests a topic to discuss, not a prediction of conflict.",
  opposition: "An opposition is traditionally read as a contrast between two approaches. Look for ways to make room for both rather than assuming one must win.",
} as const;

export function contactTopic(contact: Contact): ContactTopic {
  const ids = [contact.a, contact.b];
  if (ids.includes("mercury")) return "communication";
  if (ids.includes("moon")) return "emotional";
  if (ids.includes("venus") || ids.includes("mars")) return "connection";
  return "growth";
}

export function contactReading(contact: Contact, relationship: Relationship = "other") {
  const topic = contactTopic(contact);
  const key = [contact.a, contact.b].sort().join("|");
  const shared = relationship === "partner" ? "in your relationship" : relationship === "friend" ? "in your friendship" : relationship === "family" ? "in your family relationship" : relationship === "famous" ? "when reflecting on relationships in your own life" : "between you";
  const prompts: Record<ContactTopic, string> = {
    communication: `What helps each person feel heard ${shared}: questions, time to think, or a clear plan?`,
    emotional: `What does reassurance look like ${shared}, and how can each person ask for it directly?`,
    connection: `How do you make space for different preferences and energy levels ${shared}?`,
    growth: `Which expectations and boundaries would be useful to name explicitly ${shared}?`,
  };
  return {
    topic,
    title: `Your ${POINT_NAMES[contact.a]} ${ASPECT_BY_TYPE[contact.type].verb} their ${POINT_NAMES[contact.b]}`,
    interpretation: PAIRS[key] ?? `This contact brings your ${DOMAIN[contact.a]} into conversation with their ${DOMAIN[contact.b]}. Explore how these themes meet in actual experiences rather than assuming the chart describes either person completely.`,
    geometry: GEOMETRY[contact.type],
    prompt: prompts[topic],
    angle: ASPECT_BY_TYPE[contact.type].angle,
  };
}
