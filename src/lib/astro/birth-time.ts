import type { Sign } from "./zodiac";

/** One unbroken stretch of the requested time window with a single Rising sign. */
export interface BirthTimeSegment {
  rising: Sign;
  /** Birthplace clock, HH:mm. */
  from: string;
  to: string;
  minutes: number;
  ascFrom: number;
  ascTo: number;
  /** Whole sign house at the middle of the stretch. */
  sunHouse: number;
  moonHouse: number;
}

export interface BirthTimeResult {
  from: string;
  to: string;
  totalMinutes: number;
  segments: BirthTimeSegment[];
  /** Two signs when the Moon changes sign inside the window. */
  moonSigns: Sign[];
  moonChangeAt: string | null;
  sunSigns: Sign[];
  notes: string[];
}
