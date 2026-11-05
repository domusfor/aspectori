import type { Metadata } from "next";
import Link from "next/link";
import FamousSearch from "@/components/famous/FamousSearch";
import PersonCard from "@/components/famous/PersonCard";
import { SectionHead } from "@/components/Reading";
import Crumbs from "@/components/seo/Crumbs";
import { SIGN_INFO } from "@/lib/astro/signs";
import { SIGN_GLYPHS } from "@/lib/astro/zodiac";
import { allSummaries } from "@/lib/famous-summary";
import { CATEGORIES } from "@/data/people";

export const metadata: Metadata = {
  title: "Famous Birth Charts: Signs of 8,000+ Celebrities",
  description:
    "Browse 8,000+ famous birth charts with Sun, Moon and Rising signs, exact degrees, source ratings and a comparison with your own chart.",
  alternates: { canonical: "/charts" },
};

export default async function ChartsIndex() {
  const people = await allSummaries();
  const timed = people.filter((p) => p.rating !== "X");
  const top = people.filter((p) => p.rating === "X").slice(0, 12);
  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 sm:px-8 pb-10">
      <Crumbs items={[["Home", "/"], ["Famous charts", "/charts"]]} />
      <header className="relative z-20 pt-6 pb-10 max-w-3xl">
        <p className="rise kicker text-gold">Famous charts</p>
        <h1 className="rise font-serif text-5xl sm:text-6xl font-medium leading-[1.02] mt-4" style={{ "--i": 1 } as React.CSSProperties}>
          The birth charts of {people.length.toLocaleString("en")} famous people.
        </h1>
        <p className="rise mt-5 text-ink-2 leading-relaxed" style={{ "--i": 2 } as React.CSSProperties}>
          Every chart tells you how far to trust it. Ratings from AA to C mean a birth time was reported, from a birth record at best to an uncertain account at worst. X means we have the date but no verified time, so we show the Sun and Moon and leave out the Rising sign rather than guess.
        </p>
        <div className="rise relative z-30 mt-8" style={{ "--i": 3 } as React.CSSProperties}><FamousSearch total={people.length} /></div>
      </header>

      <section>
        <SectionHead kicker="Birth time on record · checked against Astro.com" title="Complete charts with Sun, Moon and Rising" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {timed.slice(0, 9).map((p, i) => <PersonCard key={p.slug} p={p} i={i} />)}
        </div>
      </section>

      <section className="mt-20">
        <SectionHead kicker="Featured names" title="Sun and Moon signs of well-known people" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((p, i) => <PersonCard key={p.slug} p={p} i={i} />)}
        </div>
      </section>

      <section className="mt-20 grid gap-10 md:grid-cols-2">
        <div>
          <SectionHead kicker="Browse" title="By field" />
          <ul className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <Link href={`/charts/category/${c.toLowerCase()}`} className="panel flex justify-between px-4 py-3 text-sm hover:border-[var(--gold)]">
                  <span>{c}</span>
                  <span className="text-muted">{people.filter((p) => p.category === c).length.toLocaleString("en")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionHead kicker="Browse" title="By Sun sign" />
          <ul className="grid grid-cols-3 gap-2">
            {SIGN_INFO.map((s, i) => (
              <li key={s.slug}>
                <Link href={`/zodiac/${s.slug}`} className="panel flex items-center gap-2 px-3 py-3 text-sm hover:border-[var(--gold)]">
                  <span className="glyph text-gold">{SIGN_GLYPHS[i]}</span>{s.sign}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
