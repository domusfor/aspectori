import type { Aspect, AspectType } from "./aspects";
import type { BodyId, PointId } from "./zodiac";

export interface Place {
  label: string;
  lat: number;
  lon: number;
  /** IANA zone, e.g. Europe/Sofia. Historical offsets come from the tz database. */
  tz: string;
}

export interface BirthInput {
  date: string; // YYYY-MM-DD, local calendar date
  time: string | null; // HH:MM or HH:MM:SS local clock time, null if unknown
  place: Place;
  /** Manual UTC offset in minutes east, overriding the time zone database. */
  offset?: number | null;
}

export type HouseSystem = "placidus" | "whole";

export interface PointRow {
  id: PointId;
  lon: number;
  speed: number;
  retro: boolean;
  /** Unknown time only: where the point was at 00:00 and 23:59 local. */
  range?: { start: number; end: number; ingressLocal?: string };
  /** Known time only. Placidus is null above the polar circles, where it cannot be computed. */
  houses?: { placidus: number | null; whole: number; porphyry: number };
}

export interface Chart {
  input: BirthInput;
  timeKnown: boolean;
  /** Local + UTC of the moment used (or of the day bounds when time is unknown). */
  moment: { localLabel: string; utc: string; offset: string; offsetSource: "tz" | "lmt" | "manual" };
  notes: string[];
  points: PointRow[];
  cusps?: { placidus: number[] | null; whole: number[]; porphyry: number[] };
  aspects: Aspect[];
  /** Planets and angles within 1° of a classic fixed star. */
  stars: StarContact[];
}

export interface StarContact {
  star: string;
  point: PointId;
  /** Star longitude at birth (stars drift about 1° every 72 years). */
  lon: number;
  orb: number;
}

export interface Contact extends Aspect {
  easy: boolean;
}

export interface CoupleResult {
  a: Chart;
  b: Chart;
  contacts: Contact[];
  allContacts: Contact[];
}

export interface Transit {
  planet: BodyId;
  target: PointId;
  type: AspectType;
  start: string; // YYYY-MM-DD
  end: string;
  exact: string[]; // dates of closest approach in each pass
}

export interface YearResult {
  from: string;
  to: string;
  transits: Transit[];
  skippedTargets: PointId[];
}

export interface WeekTransit {
  planet: BodyId;
  target: PointId;
  type: AspectType;
  /** UTC calendar days with at least one qualifying six-hour sample. */
  activeDates: string[];
  closestAt: string;
  transitLon: number;
  natalLongitudes: number[];
  /** Orb range across the natal samples at the closest transit sample. */
  minOrb: number;
  maxOrb: number;
}

export interface WeekResult {
  from: string;
  to: string;
  calculatedAt: string;
  timeZone: "UTC";
  sampleHours: 6;
  orbLimit: 1;
  timeKnown: boolean;
  transits: WeekTransit[];
  qualifyingContacts: number;
  skippedTargets: PointId[];
}

export interface SkyResult {
  at: string;
  /** Geocentric positions now; no houses. Drawn with 0° Aries on the left. */
  chart: Chart;
  moon: { phase: string; illumination: number; waxing: boolean; ingress: string };
}
