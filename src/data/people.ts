import "server-only";
import { FAMOUS, type Category, type Famous } from "./famous";
import raw from "./people.json";

interface Row { q: string; s: string; n: string; d: string; b: string; p: string; la: number; lo: number; tz: string; c: string; w: number }

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Famous people from Wikidata (CC0): birth date and place, no birth time. */
const IMPORTED: Famous[] = (raw as Row[]).map((r) => ({
  slug: r.s,
  name: r.n,
  blurb: cap(r.d),
  category: r.c as Category,
  rating: "X",
  source: "Wikidata",
  wikidata: r.q,
  popularity: r.w,
  birth: { date: r.b, time: null, place: { label: r.p, lat: r.la, lon: r.lo, tz: r.tz } },
}));

/** Every famous chart, curated first, then by how widely known the person is. */
export const ALL_FAMOUS: Famous[] = [...FAMOUS, ...IMPORTED].sort((a, b) => b.popularity - a.popularity);

const BY_SLUG = new Map(ALL_FAMOUS.map((f) => [f.slug, f]));
export const famousBySlug = (slug: string) => BY_SLUG.get(slug);

export const CATEGORIES = Array.from(new Set(ALL_FAMOUS.map((f) => f.category))).sort() as Category[];
