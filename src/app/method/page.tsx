import type { Metadata } from "next";
import Crumbs from "@/components/seo/Crumbs";

export const metadata: Metadata = {
  title: "How Aspectori Calculates Your Birth Chart",
  description: "How Aspectori calculates planetary positions, historical time zones, houses and transits, and handles your birth details.",
  alternates: { canonical: "/method" },
};

export default function Method() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 sm:px-8 pb-16">
      <Crumbs items={[["Home", "/"], ["Method", "/method"]]} />
      <p className="kicker text-gold mt-10">Method</p>
      <h1 className="font-serif text-5xl font-medium leading-tight mt-3">How the chart is calculated</h1>

      <Section title="Positions">
        Planet positions come from the Swiss Ephemeris with its full data files, the same engine Astro.com uses.
        We calculate apparent geocentric positions, as seen from Earth, in the tropical zodiac. Every release is checked against 29 charts from
        Astro-Databank: the Sun, Moon and Ascendant must match Astro.com to the printed arcminute.
      </Section>

      <Section title="Time zones">
        A birth time is a clock time, and clocks have changed a lot: war time, double summer time, year-round daylight
        time in the US in 1974. We use the historical time zone database for the birthplace and date. Before a country
        adopted standard time, we use the birthplace&apos;s own local mean time, as Astro.com does. If your birth
        certificate states a different offset, set it by hand under &ldquo;Time zone&rdquo;. The offset we used is
        printed under your card.
      </Section>

      <Section title="Unknown birth time">
        The Ascendant moves through all twelve signs in a day, and the houses move with it. Without a time we do not
        guess. We show where each planet was at the start and end of the local birth day and keep only aspects present at both moments. A contact could still come and go between those two checks, especially when a planet is turning or near a sign change. If the Moon changed sign
        that day, we show both signs and the time it switched. We never infer a missing birth time.
      </Section>

      <Section title="Houses">
        Placidus and whole sign divide the chart differently, so we show both. A third system, Porphyry, is listed
        in the comparison table. When Placidus cannot be calculated at a high latitude, the chart uses whole sign
        and explains the limitation.
      </Section>

      <Section title="Comparison house overlays" id="house-overlays">
        We place each person’s ten planets in the other person’s houses, in both directions, using ecliptic longitude.
        Whole sign and Placidus sectors are listed separately. A planet on a cusp belongs to the house starting there;
        no cusp orb or planetary-latitude correction is applied. The house owner needs a known birth time. If only
        the planet owner’s time is missing, the table shows the planetary positions at the start and end of that
        person’s local birth day. Matching endpoint house numbers do not establish a full-day assignment: the planet
        may cross a boundary and return between samples. Placidus remains unavailable where the engine cannot
        calculate it at high latitudes. Angles, Chiron and the node are excluded from overlays. The same results and
        limits appear in the free comparison PDF. See{" "}
        <a className="text-gold underline" href="https://cafeastrology.com/articles/synastryplanetsinhouses.html">Cafe Astrology’s introduction to house overlays</a>{" "}
        for the interpretive convention; this does not establish scientific validity for relationship claims.
      </Section>

      <Section title="Aspects and orbs">
        Conjunction and opposition 8°, square and trine 7°, sextile 5°. The card shows the tightest aspect that is
        personal to you. Aspects between two slow planets, such as Uranus and Pluto, are left off the card because
        everyone born within a few years of you shares them. For couples, orbs are three quarters of these, and
        contacts with personal planets rank first.
      </Section>

      <Section title="Your week ahead" id="week">
        The weekly horoscope covers today and the next six calendar days in UTC, sampled at 00:00, 06:00, 12:00 and
        18:00 UTC. We check the Sun, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto against your natal
        Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rising and Midheaven. The fast-moving transiting Moon is not
        included in this weekly selection. Conjunctions, sextiles, squares, trines and oppositions must fall within 1°.
        Without a birth time, we omit natal Moon and angle contacts and require the other contacts to qualify at both
        birth-day endpoints. The displayed orb values describe those samples, not every possible birth time between them.
        We rank contacts by their closest sampled orb, first choosing distinct topics, then filling up to three places.
        This is an editorial selection, not a prediction of importance. Marked dates have at least one qualifying sample;
        they are not exact start or end dates. The closest sampled time is not necessarily an exact pass. Each theme
        combines fixed symbolic interpretations with a reflection prompt. Reopening your chart or refreshing the week
        recalculates the current window; an open tab also refreshes when its UTC date changes.
      </Section>

      <Section title="Birth Moon phase" id="birth-moon">
        Lunar illumination comes from Swiss Ephemeris planetary phenomena, using the geocentric illuminated fraction.
        Phase labels follow the Moon-minus-Sun ecliptic longitude: primary phases are labelled “near” within 10° of
        0°, 90°, 180° and 270°. The exact primary phases are instants. Unknown birth times use hourly samples across
        the resolved local day, plus both endpoints, including short or long daylight-saving days. Reported illumination
        bounds are sampled values. The schematic Moon does not reproduce its orientation above a local horizon.
      </Section>

      <Section title="Chart rulers and annual profections" id="rulership">
        Chart rulers follow the Ascendant sign. Traditional and modern schemes are shown separately where they differ:
        Scorpio uses Mars or Pluto, Aquarius Saturn or Uranus, and Pisces Jupiter or Neptune. Annual profections always
        use the traditional scheme, counting whole signs from the Ascendant. The house number is completed age modulo
        twelve, plus one. Without a birth time only that age-based number is available; its sign and time lord are
        unknown. Birthday intervals use February 28 for February 29 births in non-leap years. The starting age uses
        today’s UTC calendar date and can be changed. This is a conventional symbolic count, not a calculated return or
        a prediction of what will happen during the year.
      </Section>

      <Section title="The year">
        Jupiter, Saturn, Uranus, Neptune and Pluto, measured against your Sun, Moon, Mercury, Venus, Mars, Jupiter,
        Saturn, Ascendant and Midheaven, within 1°. A transit that loops back over the same point when the planet
        goes retrograde is one entry with several exact dates. We pick six, favouring slow planets, hard aspects and
        your Sun, Moon and Ascendant.
      </Section>

      <Section title="Famous charts">
        Birth data for famous people comes with a Rodden Rating, the astrologers&apos; standard for how reliable a birth
        time is: AA from a birth certificate or record, A from the person or family, B from a biography, C uncertain.
        Our curated reference charts are checked against Astro.com to the arcminute. The larger collection comes
        from Wikidata and is rated X: the date is known but the birth time is not. Those entries omit the Rising
        sign and houses. Individual pages identify their data source and reliability rating.
      </Section>

      <Section title="The words">
        Every sentence comes from a fixed library: one entry per placement, house and aspect type. Nothing is generated
        when you press the button, and the page only shows the entries that match your chart. Astrology is for
        entertainment. Nothing here is advice.
      </Section>

      <Section title="Privacy" id="privacy">
        Your saved chart details live in the URL fragment, which browsers do not send with ordinary web requests.
        Chart calculations still send the details you enter to the server in a POST request. We do not put them in an
        application database or use advertising trackers. Hosting services may retain technical request logs, and city
        searches are sent through our server to the configured geocoding provider. Read the full privacy notice for
        the configured providers, retention period and your rights.
      </Section>
    </main>
  );
}

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section className="mt-10 scroll-mt-10" id={id}>
      <h2 className="font-serif text-2xl font-medium">{title}</h2>
      <p className="mt-2 text-ink-2 leading-relaxed">{children}</p>
    </section>
  );
}
