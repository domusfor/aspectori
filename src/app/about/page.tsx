import type { Metadata } from "next";
import Crumbs from "@/components/seo/Crumbs";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Aspectori",
  description: "How Aspectori combines transparent astrology calculations, sourced birth data and practical explanations without accounts or advertising.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-8">
      <Crumbs items={[["Home", "/"], ["About", "/about"]]} />
      <p className="kicker mt-10 text-gold">About Aspectori</p>
      <h1 className="mt-3 font-serif text-5xl font-medium leading-tight">Astrology you can inspect.</h1>
      <p className="mt-6 text-lg leading-relaxed text-ink-2">
        Aspectori is an independent chart-calculation and learning platform. It pairs precise planetary positions with
        plain explanations, visible calculation evidence and honest handling of unknown birth times.
      </p>

      <Section title="What we build">
        <p>Free natal charts, sign and house calculators, relationship comparisons, famous-chart references, learning guides and downloadable reports.</p>
        <p className="mt-3">The core experience requires no account, email address or payment.</p>
      </Section>

      <Section title="How calculations work">
        <p>Planetary positions come from the Swiss Ephemeris. Historical local times use the IANA time-zone database, with explicit handling for daylight-saving gaps, overlaps and unknown times.</p>
        <p className="mt-3">Aspectori shows degrees, house systems, source ratings and calculation limits so results can be checked rather than accepted as a black box.</p>
        <p className="mt-4"><Link className="text-gold underline" href="/method">Read the calculation method</Link> or <Link className="text-gold underline" href="/accuracy">see the reference checks and limits</Link>.</p>
      </Section>

      <Section title="Editorial standard">
        <p>Calculation statements describe reproducible software output. Interpretations describe established astrological traditions and are written for reflection and entertainment. They are not presented as scientific personality tests, medical advice, financial advice or a substitute for professional judgment.</p>
      </Section>

      <Section title="Data and independence">
        <p>Famous birth dates and places are sourced from Wikidata, while curated timed charts identify their Rodden source rating. Aspectori carries no advertising, sponsored rankings or paid placement. Google Analytics runs only for visitors who accept it.</p>
        <p className="mt-3">Aspectori is free software. Its complete source is published under the GNU Affero General Public License so anyone can inspect the calculations, learn from the implementation and contribute improvements.</p>
        <p className="mt-4"><a className="text-gold underline" href="https://github.com/domusfor/aspectori">View the Aspectori source on GitHub</a>.</p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-10"><h2 className="font-serif text-3xl">{title}</h2><div className="mt-4 leading-relaxed text-ink-2">{children}</div></section>;
}
