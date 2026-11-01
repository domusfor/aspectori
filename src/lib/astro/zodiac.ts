// Shared, pure data and formatting. Safe on both server and client.

export const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;
export type Sign = (typeof SIGNS)[number];

// U+FE0E forces text presentation so iOS does not render these as emoji.
export const SIGN_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].map((g) => g + "︎");

export const BODY_IDS = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
] as const;
/** Points shown in the chart but kept out of aspects, so the card stays about planets. */
export const EXTRA_IDS = ["node", "chiron"] as const;
export const ALL_BODY_IDS = [...BODY_IDS, ...EXTRA_IDS] as const;
export type PlanetId = (typeof BODY_IDS)[number];
export type BodyId = (typeof ALL_BODY_IDS)[number];
export type PointId = BodyId | "asc" | "mc";

export const POINT_NAMES: Record<PointId, string> = {
  sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars",
  jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus", neptune: "Neptune", pluto: "Pluto",
  node: "North Node", chiron: "Chiron",
  asc: "Rising", mc: "Midheaven",
};

export const POINT_GLYPHS: Record<PointId, string> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
  node: "☊", chiron: "⚷",
  asc: "AC", mc: "MC",
};

// Generational bodies: everyone born within months (or years) of you shares them.
export const SLOW: ReadonlySet<PointId> = new Set(["jupiter", "saturn", "uranus", "neptune", "pluto", "node", "chiron"]);

export const signIndex = (lon: number) => Math.floor(norm(lon) / 30);
export const signOf = (lon: number): Sign => SIGNS[signIndex(lon)];

export function norm(lon: number) {
  const x = lon % 360;
  return x < 0 ? x + 360 : x;
}

/** Degrees and arcminutes within the sign, e.g. 14°22′. Rounded like Astro.com, but never onto the next sign. */
export function fmtDeg(lon: number) {
  const total = Math.min(Math.round((norm(lon) % 30) * 60), 30 * 60 - 1);
  return `${Math.floor(total / 60)}°${String(total % 60).padStart(2, "0")}′`;
}

export const fmtPos = (lon: number) => `${fmtDeg(lon)} ${signOf(lon)}`;

/** Orb in degrees → 0°40′ */
export function fmtOrb(orb: number) {
  const d = Math.floor(orb);
  const m = Math.round((orb - d) * 60);
  return m === 60 ? `${d + 1}°00′` : `${d}°${String(m).padStart(2, "0")}′`;
}

export function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
