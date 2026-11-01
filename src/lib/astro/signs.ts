// Reference content for the zodiac sign pages. Written for this site; no generated text.
import { SIGNS, type Sign } from "./zodiac";

export type Element = "Fire" | "Earth" | "Air" | "Water";

export interface SignInfo {
  sign: Sign;
  slug: string;
  /** Usual Sun dates; the exact switch moves by a day or so from year to year. */
  dates: string;
  element: Element;
  modality: "Cardinal" | "Fixed" | "Mutable";
  ruler: string;
  keywords: string[];
  about: string;
}

export const SIGN_INFO: SignInfo[] = [
  { sign: "Aries", dates: "March 21 – April 19", element: "Fire", modality: "Cardinal", ruler: "Mars",
    keywords: ["direct", "brave", "impatient", "competitive"],
    about: "Aries starts the zodiac and acts like it: first to move, first to speak, first to get bored. The sign runs on momentum and does its best work at the beginning of things, when nerve matters more than patience." },
  { sign: "Taurus", dates: "April 20 – May 20", element: "Earth", modality: "Fixed", ruler: "Venus",
    keywords: ["steady", "sensual", "loyal", "stubborn"],
    about: "Taurus builds slowly and keeps what it builds. It trusts what it can touch, taste and count, and it would rather do one thing well for years than many things for a week." },
  { sign: "Gemini", dates: "May 21 – June 20", element: "Air", modality: "Mutable", ruler: "Mercury",
    keywords: ["curious", "quick", "talkative", "restless"],
    about: "Gemini collects ideas, people and conversations. It thinks by talking, learns by switching, and is at its best when there are two things to compare." },
  { sign: "Cancer", dates: "June 21 – July 22", element: "Water", modality: "Cardinal", ruler: "Moon",
    keywords: ["protective", "intuitive", "loyal", "moody"],
    about: "Cancer leads with care. It builds a shell around the people it loves and decides what it thinks after it has decided how it feels." },
  { sign: "Leo", dates: "July 23 – August 22", element: "Fire", modality: "Fixed", ruler: "Sun",
    keywords: ["warm", "proud", "generous", "dramatic"],
    about: "Leo wants to make something people notice and to be generous while doing it. It is loyal, theatrical and hurt more by being ignored than by being criticized." },
  { sign: "Virgo", dates: "August 23 – September 22", element: "Earth", modality: "Mutable", ruler: "Mercury",
    keywords: ["precise", "useful", "modest", "critical"],
    about: "Virgo notices what is slightly off and cannot leave it alone. It shows love by fixing things and is happiest when it is useful." },
  { sign: "Libra", dates: "September 23 – October 22", element: "Air", modality: "Cardinal", ruler: "Venus",
    keywords: ["fair", "charming", "diplomatic", "indecisive"],
    about: "Libra weighs every side before it moves. It is drawn to beauty and balance, and it thinks most clearly with someone across the table." },
  { sign: "Scorpio", dates: "October 23 – November 21", element: "Water", modality: "Fixed", ruler: "Pluto and Mars",
    keywords: ["intense", "private", "loyal", "all-or-nothing"],
    about: "Scorpio commits completely or not at all. It is private, perceptive and slow to trust, and it remembers everything." },
  { sign: "Sagittarius", dates: "November 22 – December 21", element: "Fire", modality: "Mutable", ruler: "Jupiter",
    keywords: ["adventurous", "honest", "optimistic", "restless"],
    about: "Sagittarius needs room and a reason. It travels, studies and argues in search of the bigger picture, and it says the blunt thing out loud." },
  { sign: "Capricorn", dates: "December 22 – January 19", element: "Earth", modality: "Cardinal", ruler: "Saturn",
    keywords: ["ambitious", "disciplined", "patient", "reserved"],
    about: "Capricorn plays the long game. It respects structure, earns its place and quietly keeps score, often getting warmer and freer with age." },
  { sign: "Aquarius", dates: "January 20 – February 18", element: "Air", modality: "Fixed", ruler: "Uranus and Saturn",
    keywords: ["independent", "inventive", "principled", "detached"],
    about: "Aquarius cares about people in general and resists being told what to do in particular. It thinks in systems and future plans, and it will not fake a feeling." },
  { sign: "Pisces", dates: "February 19 – March 20", element: "Water", modality: "Mutable", ruler: "Neptune and Jupiter",
    keywords: ["empathic", "imaginative", "gentle", "elusive"],
    about: "Pisces absorbs the mood of a room and turns it into art, faith or kindness. It needs time alone to find out which feelings are its own." },
].map((s) => ({ ...s, slug: s.sign.toLowerCase() })) as SignInfo[];

export const signInfo = (sign: Sign) => SIGN_INFO[SIGNS.indexOf(sign)];
export const signBySlug = (slug: string) => SIGN_INFO.find((s) => s.slug === slug);

/** How a Sun and Moon of two elements tend to sit together. */
export function elementBlend(sun: Element, moon: Element) {
  if (sun === moon) return `Both ${sun.toLowerCase()} signs: what you want and what you need point the same way, which makes you easy to read and hard to divert.`;
  const easy = new Set(["Fire|Air", "Air|Fire", "Earth|Water", "Water|Earth"]);
  if (easy.has(`${sun}|${moon}`)) return `${sun} and ${moon.toLowerCase()} feed each other: the Sun supplies the drive and the Moon supplies the fuel, so the combination usually feels natural from the inside.`;
  return `${sun} and ${moon.toLowerCase()} pull in different directions: what you want and what you need do not always agree, and much of your growth comes from making them cooperate.`;
}

export const comboSlug = (sun: Sign, moon: Sign) => `${sun.toLowerCase()}-sun-${moon.toLowerCase()}-moon`;
export function parseCombo(slug: string): [Sign, Sign] | null {
  const m = /^([a-z]+)-sun-([a-z]+)-moon$/.exec(slug);
  const sun = m && signBySlug(m[1]), moon = m && signBySlug(m[2]);
  return sun && moon ? [sun.sign, moon.sign] : null;
}
