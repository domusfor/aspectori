import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife } from "next/cache";
import { DateTime } from "luxon";
import Crumbs from "@/components/seo/Crumbs";
import JsonLd, { siteUrl } from "@/components/seo/JsonLd";
import { computeRetrogrades } from "@/lib/astro/engine";
import { fmtPos } from "@/lib/astro/zodiac";

const FIRST_YEAR = 2026, LAST_YEAR = 2028;

export const metadata: Metadata = {
  title: `Mercury Retrograde Dates ${FIRST_YEAR}–${LAST_YEAR}`,
  description: `Every Mercury retrograde from ${FIRST_YEAR} to ${LAST_YEAR}, with station dates and zodiac degrees calculated from the Swiss Ephemeris, and what the motion actually is.`,
  alternates: { canonical: "/mercury-retrograde" },
};

async function periods() {
  "use cache";
  cacheLife("max");
  // Format here too: the date library reads the clock, which only a cached scope may do.
  const at = (iso: string) => DateTime.fromISO(iso, { zone: "utc" }).toFormat("d LLL yyyy, HH:mm");
  return computeRetrogrades("mercury", DateTime.utc(FIRST_YEAR, 1, 1), DateTime.utc(LAST_YEAR + 1, 1, 1))
    .map((p) => ({ ...p, startLabel: at(p.start), endLabel: at(p.end) }));
}

export default async function Page() {
  const list = await periods();
  const years = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i);
  return <main className="mx-auto max-w-3xl px-4 sm:px-8 pb-12">
    <Crumbs items={[["Home", "/"], ["Learn", "/learn"], ["Mercury retrograde", "/mercury-retrograde"]]} />
    <header className="py-9">
      <p className="kicker text-gold">Calculated from the Swiss Ephemeris</p>
      <h1 className="font-serif text-4xl sm:text-5xl mt-4 leading-tight">Mercury retrograde dates, {FIRST_YEAR} to {LAST_YEAR}</h1>
      <p className="mt-5 text-lg text-ink-2 leading-relaxed">Mercury appears to reverse direction about three times a year, for roughly three weeks each time. All times below are UTC, so your local date may differ by a day.</p>
    </header>
    {years.map((year) => <section key={year} className="mt-8">
      <h2 className="font-serif text-3xl">{year}</h2>
      <ul className="mt-4 grid gap-3">{list.filter((p) => p.start.startsWith(String(year))).map((p) => <li key={p.start} className="panel grid gap-3 p-4 text-sm tabular-nums sm:grid-cols-3">
        <div><p className="text-xs text-muted">Turns retrograde</p><p className="mt-1">{p.startLabel}</p></div>
        <div><p className="text-xs text-muted">Turns direct</p><p className="mt-1">{p.endLabel}</p></div>
        <div><p className="text-xs text-muted">Zodiac span</p><p className="mt-1">{fmtPos(p.startLon)} to {fmtPos(p.endLon)}</p></div>
      </li>)}</ul>
    </section>)}
    <section className="mt-12"><h2 className="font-serif text-3xl">What is actually happening</h2><p className="mt-4 text-ink-2 leading-relaxed">Mercury does not reverse its orbit. It moves faster than Earth on a smaller orbit, so as it passes between us and the Sun its position against the background stars appears to drift backward. The dates above are stations, the moments its apparent longitude stops changing direction, measured from Earth’s center.</p></section>
    <section className="mt-10"><h2 className="font-serif text-3xl">What astrology says about it</h2><p className="mt-4 text-ink-2 leading-relaxed">Astrologers traditionally connect these periods with review: rereading, rechecking and returning to unfinished conversations. That is a symbolic reading rather than a demonstrated effect. There is no good evidence that it causes travel delays or broken phones, so it is not a reason to delay something important.</p><p className="mt-4 text-ink-2 leading-relaxed">To see how current transits touch your own chart, <Link className="text-gold underline" href="/weekly-horoscope">read your week ahead</Link>.</p></section>
    <p className="mt-10 text-sm text-muted">Sources: <a className="text-gold underline" href="https://science.nasa.gov/mercury/">NASA: Mercury</a> and our <Link className="text-gold underline" href="/method">calculation method</Link>.</p>
  <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: String(metadata.title), description: metadata.description, datePublished: "2026-11-05", author: { "@type": "Organization", name: "Aspectori", url: siteUrl }, publisher: { "@id": `${siteUrl}/#org` }, mainEntityOfPage: `${siteUrl}/mercury-retrograde` }} />
  </main>;
}
