import type { BirthInput } from "@/lib/astro/types";

export type Category = "Science" | "Politics" | "Royalty" | "Music" | "Art" | "Sport" | "Business" | "Film" | "Writing" | "Thought";

export interface Famous {
  slug: string;
  name: string;
  /** One line describing who they are. */
  blurb: string;
  category: Category;
  /**
   * Rodden Rating of the birth time: AA birth record, A quoted by the person or family, B biography,
   * C caution, X date known but no time.
   */
  rating: "AA" | "A" | "B" | "C" | "X";
  source: string;
  birth: BirthInput;
  /** Wikipedia language editions: a rough measure of how widely known someone is. */
  popularity: number;
  wikidata?: string;
}

const ADB = "Astro-Databank";
// Curated charts outrank the imported ones in every list.
const CURATED_POPULARITY = 1000;

/**
 * Seed list. Every entry matches Astro.com to the arcminute (see tests/astrocom.test.ts).
 * Before adding entries at scale, source birth data independently (birth records, biographies)
 * rather than copying a database wholesale, and keep the rating honest.
 */
export const FAMOUS: Famous[] = [
  {
    slug: "albert-einstein", name: "Albert Einstein", category: "Science", rating: "AA", source: `${ADB}, birth record`, popularity: CURATED_POPULARITY,
    blurb: "Physicist whose relativity papers rewrote space, time and gravity.",
    birth: { date: "1879-03-14", time: "11:30", place: { label: "Ulm, Germany", lat: 48.4, lon: 10, tz: "Europe/Berlin" } },
  },
  {
    slug: "marie-curie", name: "Marie Curie", category: "Science", rating: "AA", source: `${ADB}, birth record`, popularity: CURATED_POPULARITY,
    blurb: "Chemist and physicist, the first person to win Nobel Prizes in two sciences.",
    birth: { date: "1867-11-07", time: "12:00", place: { label: "Warsaw, Poland", lat: 52.25, lon: 21, tz: "Europe/Warsaw" } },
  },
  {
    slug: "sigmund-freud", name: "Sigmund Freud", category: "Thought", rating: "AA", source: `${ADB}, birth record`, popularity: CURATED_POPULARITY,
    blurb: "Founder of psychoanalysis and of the talking cure.",
    // Prague mean time, as recorded; the tz database cannot distinguish it from local mean time.
    birth: { date: "1856-05-06", time: "18:30", offset: 57.733, place: { label: "Příbor, Czech Republic", lat: 49.65, lon: 18.1667, tz: "Europe/Prague" } },
  },
  {
    slug: "carl-jung", name: "Carl Gustav Jung", category: "Thought", rating: "C", source: `${ADB}, family account`, popularity: CURATED_POPULARITY,
    blurb: "Psychiatrist behind archetypes, introversion and the collective unconscious.",
    birth: { date: "1875-07-26", time: "19:24", place: { label: "Kesswil, Switzerland", lat: 47.6, lon: 9.3333, tz: "Europe/Zurich" } },
  },
  {
    slug: "mahatma-gandhi", name: "Mohandas Gandhi", category: "Politics", rating: "C", source: `${ADB}, local mean time`, popularity: CURATED_POPULARITY,
    blurb: "Lawyer and leader of India's nonviolent independence movement.",
    birth: { date: "1869-10-02", time: "07:08:12", offset: 278.4, place: { label: "Porbandar, India", lat: 21.6333, lon: 69.6, tz: "Asia/Kolkata" } },
  },
  {
    slug: "pablo-picasso", name: "Pablo Picasso", category: "Art", rating: "AA", source: `${ADB}, birth record`, popularity: CURATED_POPULARITY,
    blurb: "Painter who co-founded Cubism and never stopped changing style.",
    birth: { date: "1881-10-25", time: "23:15", place: { label: "Málaga, Spain", lat: 36.7167, lon: -4.4167, tz: "Europe/Madrid" } },
  },
  {
    slug: "john-f-kennedy", name: "John F. Kennedy", category: "Politics", rating: "A", source: `${ADB}, family account`, popularity: CURATED_POPULARITY,
    blurb: "35th President of the United States.",
    birth: { date: "1917-05-29", time: "15:00", place: { label: "Brookline, Massachusetts, USA", lat: 42.3333, lon: -71.1167, tz: "America/New_York" } },
  },
  {
    slug: "queen-elizabeth-ii", name: "Elizabeth II", category: "Royalty", rating: "AA", source: `${ADB}, court circular`, popularity: CURATED_POPULARITY,
    blurb: "Queen of the United Kingdom for seventy years.",
    birth: { date: "1926-04-21", time: "02:40", place: { label: "Mayfair, London, UK", lat: 51.5, lon: -0.15, tz: "Europe/London" } },
  },
  {
    slug: "marilyn-monroe", name: "Marilyn Monroe", category: "Film", rating: "AA", source: `${ADB}, birth record`, popularity: CURATED_POPULARITY,
    blurb: "Actress and the defining screen star of the 1950s.",
    birth: { date: "1926-06-01", time: "09:30", place: { label: "Los Angeles, California, USA", lat: 34.05, lon: -118.25, tz: "America/Los_Angeles" } },
  },
  {
    slug: "elvis-presley", name: "Elvis Presley", category: "Music", rating: "AA", source: `${ADB}, birth record`, popularity: CURATED_POPULARITY,
    blurb: "Singer who carried rock and roll into the mainstream.",
    birth: { date: "1935-01-08", time: "04:35", place: { label: "Tupelo, Mississippi, USA", lat: 34.25, lon: -88.7, tz: "America/Chicago" } },
  },
  {
    slug: "david-bowie", name: "David Bowie", category: "Music", rating: "A", source: `${ADB}, his own account`, popularity: CURATED_POPULARITY,
    blurb: "Musician who reinvented himself with nearly every record.",
    birth: { date: "1947-01-08", time: "09:00", place: { label: "Brixton, London, UK", lat: 51.4833, lon: -0.1, tz: "Europe/London" } },
  },
  {
    slug: "king-charles-iii", name: "Charles III", category: "Royalty", rating: "A", source: `${ADB}, palace announcement`, popularity: CURATED_POPULARITY,
    blurb: "King of the United Kingdom since 2022.",
    birth: { date: "1948-11-14", time: "21:14", place: { label: "London, UK", lat: 51.5, lon: -0.1667, tz: "Europe/London" } },
  },
  {
    slug: "angela-merkel", name: "Angela Merkel", category: "Politics", rating: "B", source: `${ADB}, biography`, popularity: CURATED_POPULARITY,
    blurb: "Chancellor of Germany for sixteen years.",
    birth: { date: "1954-07-17", time: "18:00", place: { label: "Hamburg, Germany", lat: 53.55, lon: 9.9833, tz: "Europe/Berlin" } },
  },
  {
    slug: "steve-jobs", name: "Steve Jobs", category: "Business", rating: "AA", source: `${ADB}, birth record`, popularity: CURATED_POPULARITY,
    blurb: "Co-founder of Apple and of the personal computer as a consumer product.",
    birth: { date: "1955-02-24", time: "19:15", place: { label: "San Francisco, California, USA", lat: 37.7833, lon: -122.4167, tz: "America/Los_Angeles" } },
  },
  {
    slug: "bill-gates", name: "Bill Gates", category: "Business", rating: "A", source: `${ADB}, his own account`, popularity: CURATED_POPULARITY,
    blurb: "Co-founder of Microsoft, later a full-time philanthropist.",
    birth: { date: "1955-10-28", time: "22:00", place: { label: "Seattle, Washington, USA", lat: 47.6, lon: -122.3333, tz: "America/Los_Angeles" } },
  },
  {
    slug: "madonna", name: "Madonna", category: "Music", rating: "AA", source: `${ADB}, birth record`, popularity: CURATED_POPULARITY,
    blurb: "Singer who set the template for the modern pop career.",
    birth: { date: "1958-08-16", time: "07:05", place: { label: "Bay City, Michigan, USA", lat: 43.6, lon: -83.8833, tz: "America/Detroit" } },
  },
  {
    slug: "princess-diana", name: "Diana, Princess of Wales", category: "Royalty", rating: "A", source: `${ADB}, her own account`, popularity: CURATED_POPULARITY,
    blurb: "Royal who turned humanitarian work into a global cause.",
    birth: { date: "1961-07-01", time: "19:45", place: { label: "Sandringham, Norfolk, UK", lat: 52.8333, lon: 0.5, tz: "Europe/London" } },
  },
  {
    slug: "barack-obama", name: "Barack Obama", category: "Politics", rating: "AA", source: `${ADB}, published birth certificate`, popularity: CURATED_POPULARITY,
    blurb: "44th President of the United States.",
    birth: { date: "1961-08-04", time: "19:24", place: { label: "Honolulu, Hawaii, USA", lat: 21.3, lon: -157.8667, tz: "Pacific/Honolulu" } },
  },
  {
    slug: "michael-jordan", name: "Michael Jordan", category: "Sport", rating: "AA", source: `${ADB}, birth record`, popularity: CURATED_POPULARITY,
    blurb: "Six-time NBA champion and the measure every player is held to.",
    birth: { date: "1963-02-17", time: "13:40", place: { label: "Brooklyn, New York, USA", lat: 40.6333, lon: -73.9333, tz: "America/New_York" } },
  },
  {
    slug: "roger-federer", name: "Roger Federer", category: "Sport", rating: "A", source: `${ADB}, family account`, popularity: CURATED_POPULARITY,
    blurb: "Twenty Grand Slam titles, and the most graceful game of his era.",
    birth: { date: "1981-08-08", time: "08:40", place: { label: "Basel, Switzerland", lat: 47.55, lon: 7.5833, tz: "Europe/Zurich" } },
  },
  {
    slug: "rafael-nadal", name: "Rafael Nadal", category: "Sport", rating: "AA", source: `${ADB}, birth record`, popularity: CURATED_POPULARITY,
    blurb: "Fourteen French Open titles: the most dominant run at one tournament in tennis.",
    birth: { date: "1986-06-03", time: "18:20", place: { label: "Manacor, Mallorca, Spain", lat: 39.5667, lon: 3.2, tz: "Europe/Madrid" } },
  },
];

export const RATING_LABEL: Record<Famous["rating"], string> = {
  AA: "From a birth certificate or record",
  A: "From the person, family or a close source",
  B: "From a biography",
  C: "Uncertain; treat the Rising sign with caution",
  X: "Birth date known, birth time not recorded",
};
