import { norm } from "./zodiac";

/** Primary phases are instants; these labels explicitly describe a surrounding 10° window. */
export function moonPhaseName(elongation: number) {
  const angle = norm(elongation);
  if (angle < 10 || angle >= 350) return "Near new Moon";
  if (angle < 80) return "Waxing crescent";
  if (angle < 100) return "Near first quarter";
  if (angle < 170) return "Waxing gibbous";
  if (angle < 190) return "Near full Moon";
  if (angle < 260) return "Waning gibbous";
  if (angle < 280) return "Near last quarter";
  return "Waning crescent";
}

export interface BirthMoonSample {
  at: string;
  elongation: number;
  illumination: number;
  waxing: boolean;
  phase: string;
}
export interface BirthMoonResult {
  timeKnown: boolean;
  phases: string[];
  samples: BirthMoonSample[];
  minIllumination: number;
  maxIllumination: number;
  localLabel: string;
  notes: string[];
}
