// The fixed text library. Nothing here is generated at request time: the page only
// picks the entries that match placements actually present in the chart.
import { ASPECT_BY_TYPE, type Aspect, type AspectType } from "./aspects";
import { fmtOrb, ordinal, POINT_NAMES, SLOW, type PointId, type Sign } from "./zodiac";

export const SUN: Record<Sign, string> = {
  Aries: "You move first and think on the way; waiting feels like losing.",
  Taurus: "You build slowly and keep what you build; pushed, you dig in.",
  Gemini: "You run on curiosity and conversation; boredom is the real enemy.",
  Cancer: "You protect your people first and decide what you think second.",
  Leo: "You want to make something people notice, and you want to be generous about it.",
  Virgo: "You notice what is slightly off and can't rest until it's fixed.",
  Libra: "You think out loud with other people and dislike deciding alone.",
  Scorpio: "You commit completely or not at all, and you remember everything.",
  Sagittarius: "You need room to roam and a reason that makes the trip worth it.",
  Capricorn: "You play the long game and quietly keep score.",
  Aquarius: "You care about people in general and resist being told what to do in particular.",
  Pisces: "You absorb the mood of a room and need time alone to wring it out.",
};

export const MOON: Record<Sign, string> = {
  Aries: "Feelings arrive fast and leave fast; you need to act on them to settle.",
  Taurus: "You calm down through routine, food, and the same people.",
  Gemini: "You process feelings by talking about them, often more than once.",
  Cancer: "You feel safe at home with your own people, and you feel everything.",
  Leo: "You need to be seen and appreciated before you can relax.",
  Virgo: "You soothe yourself by sorting, fixing, and being useful.",
  Libra: "You need harmony around you; conflict sits in your body.",
  Scorpio: "You feel deeply and privately, and trust is earned slowly.",
  Sagittarius: "You need space and a way out; feeling trapped is the worst feeling.",
  Capricorn: "You handle feelings by handling things, and admit them later.",
  Aquarius: "You step back from feelings to look at them; distance is how you cope.",
  Pisces: "You soak up other people's moods and need quiet to find your own.",
};

export const RISING: Record<Sign, string> = {
  Aries: "People meet someone direct and quick to start.",
  Taurus: "People meet someone calm, steady, and hard to rush.",
  Gemini: "People meet someone quick, talkative, and curious.",
  Cancer: "People meet someone warm but guarded at first.",
  Leo: "People meet someone with presence who fills the doorway.",
  Virgo: "People meet someone observant, precise, and a little reserved.",
  Libra: "People meet someone easy, polite, and pleasant to be around.",
  Scorpio: "People meet someone intense and hard to read.",
  Sagittarius: "People meet someone open, funny, and restless.",
  Capricorn: "People meet someone composed who seems older than they are.",
  Aquarius: "People meet someone friendly but hard to pin down.",
  Pisces: "People meet someone soft, dreamy, and easy to talk to.",
};

const SIGN_STYLE: Record<Sign, string> = {
  Aries: "directly, and fast",
  Taurus: "steadily, through the senses",
  Gemini: "quickly, with many tabs open",
  Cancer: "protectively, from the inside out",
  Leo: "warmly, and in plain view",
  Virgo: "precisely, by fixing what's off",
  Libra: "by weighing the other side first",
  Scorpio: "intensely, all or nothing",
  Sagittarius: "broadly, looking for the meaning",
  Capricorn: "strategically, for the long term",
  Aquarius: "independently, on your own terms",
  Pisces: "intuitively, by absorbing the room",
};

const DOMAIN: Record<PointId, string> = {
  sun: "who you are at the core",
  moon: "what you need to feel safe",
  mercury: "how you think and talk",
  venus: "how you love and what you find beautiful",
  mars: "how you go after things and how you fight",
  jupiter: "where you expect luck and want more",
  saturn: "where you feel tested and build discipline",
  uranus: "where you insist on doing it differently",
  neptune: "what you idealize",
  pluto: "where you go deep and refuse to let go",
  node: "the direction you grow toward",
  chiron: "the old hurt you learn to help others with",
  asc: "how you come across",
  mc: "the direction you are seen to be heading",
};

/** Short noun phrases, used inside aspect and transit sentences. */
export const SHORT: Record<PointId, string> = {
  sun: "your identity",
  moon: "your emotional needs",
  mercury: "your thinking",
  venus: "your affections",
  mars: "your drive",
  jupiter: "your appetite for more",
  saturn: "your sense of duty",
  uranus: "your need for freedom",
  neptune: "your ideals",
  pluto: "your intensity",
  node: "your direction of growth",
  chiron: "your old wound",
  asc: "the way you come across",
  mc: "your career and public path",
};

export const HOUSE_TOPIC = [
  "",
  "your self and first impressions",
  "money and what you value",
  "talk, siblings, and daily errands",
  "home and family",
  "creativity, romance, and play",
  "work routines and health",
  "partners and one-on-one relationships",
  "shared money, intimacy, and what's hidden",
  "travel, study, and belief",
  "career and reputation",
  "friends, groups, and the future you want",
  "solitude and what happens behind the scenes",
];

const ASPECT_PHRASE: Record<AspectType, string> = {
  conjunction: "are interpreted as closely linked themes; explore how each affects the other",
  sextile: "are traditionally read as an opportunity for cooperation that benefits from attention",
  square: "are interpreted as different approaches that may need conscious coordination",
  trine: "are traditionally associated with ease; consider what you might take for granted",
  opposition: "are read as contrasting approaches; explore how both can have room",
};

const CONTACT_PHRASE: Record<AspectType, string> = {
  conjunction: "land on the same spot; impossible to ignore",
  sextile: "an opening that works when either of you takes it",
  square: "friction that keeps it interesting and keeps you arguing",
  trine: "an easy flow that needs no explaining",
  opposition: "attraction across a gap; each has what the other lacks",
};

const TRANSIT_THEME: Partial<Record<PointId, string>> = {
  jupiter: "Growth and more room",
  saturn: "Pressure, tests, and structure",
  uranus: "Sudden change and broken routine",
  neptune: "Blur, longing, and second thoughts",
  pluto: "Slow, deep change",
};

const TRANSIT_MODE: Record<AspectType, string> = {
  conjunction: "a prompt to reflect on what is becoming more prominent",
  sextile: "a prompt to notice opportunities for constructive action",
  square: "a prompt to examine competing priorities and available choices",
  trine: "a prompt to notice which resources and habits are already helping",
  opposition: "a prompt to consider another perspective alongside your own",
};

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export function placementSentence(id: PointId, sign: Sign) {
  if (id === "sun") return SUN[sign];
  if (id === "moon") return MOON[sign];
  if (id === "asc") return RISING[sign];
  const gen =
    id === "node" ? " Shared with everyone born within about eighteen months of you."
    : SLOW.has(id) && id !== "jupiter" ? " Shared with everyone born within a few years of you." : "";
  return `${cap(DOMAIN[id])}: ${SIGN_STYLE[sign]}.${gen}`;
}

export function houseSentence(id: PointId, house: number) {
  return `Traditionally, the ${ordinal(house)} house links ${SHORT[id]} with ${HOUSE_TOPIC[house]}.`;
}

export function aspectTitle(asp: Pick<Aspect, "a" | "b" | "type">) {
  return `${POINT_NAMES[asp.a]} ${ASPECT_BY_TYPE[asp.type].verb} ${POINT_NAMES[asp.b]}`;
}

export function aspectSentence(asp: Aspect) {
  return `${cap(SHORT[asp.a])} and ${SHORT[asp.b]} ${ASPECT_PHRASE[asp.type]}.`;
}

export function aspectOrbLabel(asp: Aspect, timeKnown: boolean) {
  if (timeKnown || asp.orb - asp.minOrb < 1 / 60) return fmtOrb(asp.orb);
  return `${fmtOrb(asp.minOrb)}–${fmtOrb(asp.orb)}`;
}

export function contactSentence(asp: Aspect) {
  return `Your ${POINT_NAMES[asp.a]} and their ${POINT_NAMES[asp.b]}: ${CONTACT_PHRASE[asp.type]}.`;
}

export function transitSentence(planet: PointId, target: PointId, type: AspectType) {
  return `${TRANSIT_THEME[planet]} around ${SHORT[target]}; ${TRANSIT_MODE[type]}.`;
}
