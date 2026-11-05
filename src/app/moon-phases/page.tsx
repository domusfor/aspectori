import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife } from "next/cache";
import { DateTime } from "luxon";
import Crumbs from "@/components/seo/Crumbs";
import JsonLd, { siteUrl } from "@/components/seo/JsonLd";
import { computeLunations } from "@/lib/astro/engine";
import { fmtPos } from "@/lib/astro/zodiac";

const FIRST_YEAR = 2026, LAST_YEAR = 2027;

export const metadata: Metadata = {
  title: `New and Full Moon Dates ${FIRST_YEAR}–${LAST_YEAR}`,
  description: `Every new Moon and full Moon for ${FIRST_YEAR} and ${LAST_YEAR}, with UTC times and zodiac degrees calculated from the Swiss Ephemeris. Plus your own birth Moon phase.`,
  alternates: { canonical: "/moon-phases" },
};

async function lunations() {
  "use cache";
  cacheLife("max");
  // Format here too: the date library reads the clock, which only a cached scope may do.
  return computeLunations(DateTime.utc(FIRST_YEAR, 1, 1), DateTime.utc(LAST_YEAR + 1, 1, 1))
    .map((l) => ({ ...l, label: DateTime.fromISO(l.at, { zone: "utc" }).toFormat("d LLL yyyy, HH:mm") }));
}

export default async function Page() {
  const list = await lunations();
  return <main className="mx-auto max-w-3xl px-4 sm:px-8 pb-12">
    <Crumbs items={[["Home", "/"], ["Learn", "/learn"], ["Moon phases", "/moon-phases"]]} />
    <header className="py-9">
      <p className="kicker text-gold">Calculated from the Swiss Ephemeris</p>
      <h1 className="font-serif text-4xl sm:text-5xl mt-4 leading-tight">New and full Moon dates, {FIRST_YEAR} to {LAST_YEAR}</h1>
      <p className="mt-5 text-lg text-ink-2 leading-relaxed">A new Moon is the instant the Moon and Sun share a zodiac longitude. A full Moon is the instant they are 180° apart. Times are UTC, so your local date may differ by a day.</p>
      <Link href="/calculators/moon-phase" className="btn btn-solid mt-6">Find your birth Moon phase</Link>
    </header>
    {[FIRST_YEAR, LAST_YEAR].map((year) => <section key={year} className="mt-8">
      <h2 className="font-serif text-3xl">{year}</h2>
      <div className="mt-4"><table className="w-full text-left text-sm">
        <thead><tr className="border-b border-line text-muted"><th className="py-2 font-normal">Phase</th><th className="py-2 font-normal">Date and time (UTC)</th><th className="hidden py-2 font-normal sm:table-cell">Moon’s position</th></tr></thead>
        <tbody>{list.filter((l) => l.at.startsWith(String(year))).map((l) => <tr key={l.at} className="border-b border-line tabular-nums"><td className="py-2">{l.type === "new" ? "● New Moon" : "○ Full Moon"}</td><td className="py-2">{l.label}</td><td className="hidden py-2 sm:table-cell">{fmtPos(l.lon)}</td></tr>)}</tbody>
      </table></div>
    </section>)}
    <section className="mt-12"><h2 className="font-serif text-3xl">Astronomy and astrology, separately</h2><p className="mt-4 text-ink-2 leading-relaxed">The dates above are astronomy: geometry you can check against any almanac. Zodiac positions use the tropical zodiac, which is an astrological reference frame and does not match the constellations you would see in the sky. Astrological traditions associate new Moons with beginnings and full Moons with culmination. Those are interpretive ideas, not measured effects.</p></section>
    <p className="mt-10 text-sm text-muted">Sources: <a className="text-gold underline" href="https://science.nasa.gov/moon/moon-phases/">NASA: Moon phases</a> and our <Link className="text-gold underline" href="/method">calculation method</Link>.</p>
  <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: String(metadata.title), description: metadata.description, datePublished: "2026-11-05", author: { "@type": "Organization", name: "Aspectori", url: siteUrl }, publisher: { "@id": `${siteUrl}/#org` }, mainEntityOfPage: `${siteUrl}/moon-phases` }} />
  </main>;
}
