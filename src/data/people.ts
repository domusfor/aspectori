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

// A curated record has a sourced birth time, so it always replaces its date-only twin.
const CURATED_IDS = new Set(FAMOUS.flatMap((f) => (f.wikidata ? [f.wikidata] : [])));

/** Every famous chart, curated first, then by how widely known the person is. */
export const ALL_FAMOUS: Famous[] = [...FAMOUS, ...IMPORTED.filter((f) => !CURATED_IDS.has(f.wikidata!))].sort((a, b) => b.popularity - a.popularity);

/**
 * Search launch cohort. Keep the full directory available to people while only
 * asking search engines to index the strongest profiles initially.
 */
export const FAMOUS_INDEX_LIMIT = 150;
/**
 * Profiles outside the top cohort that already earn Google impressions
 * (5+ in the 90 days to 19 Nov 2026), so pruning does not drop pages with search demand.
 */
export const SEARCH_TRACTION_SLUGS = new Set([
  "madison-beer", "j-robert-oppenheimer", "wilhelm-wundt", "fyodor-dostoevsky", "benito-mussolini", "benjamin-netanyahu",
  "ursula-von-der-leyen", "karl-marx", "ada-lovelace", "donald-trump", "charlie-chaplin", "marie-curie", "lal-bahadur-shastri",
  "arthur-rimbaud", "richard-dawkins", "madonna", "erwin-schrodinger", "marilyn-monroe", "c-s-lewis", "michael-phelps",
  "ursula-k-le-guin", "david-bowie", "princess-diana", "charles-baudelaire", "elon-musk", "charles-dickens",
  "srinivasa-ramanujan", "isaiah-berlin", "king-charles-iii", "robert-louis-stevenson", "queen-elizabeth-ii",
  "recep-tayyip-erdogan", "magnus-carlsen", "maria-zakharova", "mary-baker-eddy", "angela-merkel", "victor-hugo",
  "zinedine-zidane", "vincent-van-gogh", "max-planck", "pierre-curie", "garry-kasparov", "vladimir-putin", "narendra-modi",
  "louis-pasteur", "stefan-zweig", "pope-francis", "linus-torvalds", "kylian-mbappe",
]);
export const INDEXABLE_FAMOUS = ALL_FAMOUS.filter((f, i) => i < FAMOUS_INDEX_LIMIT || SEARCH_TRACTION_SLUGS.has(f.slug));
const INDEXABLE_SLUGS = new Set(INDEXABLE_FAMOUS.map((f) => f.slug));
export const isFamousIndexable = (slug: string) => INDEXABLE_SLUGS.has(slug);

const BY_SLUG = new Map(ALL_FAMOUS.map((f) => [f.slug, f]));
export const famousBySlug = (slug: string) => BY_SLUG.get(slug);

export const CATEGORIES = Array.from(new Set(ALL_FAMOUS.map((f) => f.category))).sort() as Category[];
