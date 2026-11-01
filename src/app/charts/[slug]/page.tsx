import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import FamousChart from "@/components/famous/FamousChart";
import JsonLd from "@/components/seo/JsonLd";
import RouteLoading from "@/components/site/RouteLoading";
import { ALL_FAMOUS, famousBySlug } from "@/data/people";
import { allSummaries, famousChart, famousSummary } from "@/lib/famous-summary";

// The best-known 500 are built ahead; the rest render on first visit and are cached.
export function generateStaticParams() {
  return ALL_FAMOUS.slice(0, 500).map((f) => ({ slug: f.slug }));
}

type Props = { params: Promise<{ slug: string }> };
const both = (s: string[]) => s.join(" or ");
const metadataName = (name: string) => name.split(",", 1)[0];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await famousSummary((await params).slug);
  if (!s) return {};
  const shortName = metadataName(s.name);
  const title = shortName.length > 28
    ? `${shortName} Birth Chart`
    : `${shortName} Birth Chart & Zodiac Sign`;
  const timeNote = s.rating === "X" ? "Birth time unknown; Rising omitted." : `Recorded time · Rodden ${s.rating}.`;
  return {
    title: { absolute: `${title} | Aspectori` },
    description: `${shortName}: ${both(s.sun)} Sun, ${both(s.moon)} Moon${s.rising ? `, ${s.rising} Rising` : ""}. ${timeNote} View the natal chart, source rating and comparison.`,
    alternates: { canonical: `/charts/${s.slug}` },
    openGraph: { title, type: "profile" },
  };
}

export default function FamousPage({ params }: Props) {
  return <Suspense fallback={<RouteLoading label="birth chart" />}><FamousChartPage params={params} /></Suspense>;
}

async function FamousChartPage({ params }: Props) {
  const { slug } = await params;
  const f = famousBySlug(slug);
  if (!f) notFound();
  const [chart, summary, all] = await Promise.all([famousChart(slug), famousSummary(slug), allSummaries()]);
  const sameSun = all.filter((o) => o.slug !== slug && o.sun.length === 1 && o.sun[0] === summary!.sun[0]).slice(0, 6);
  const sameField = all.filter((o) => o.slug !== slug && o.category === f.category).slice(0, 4);

  const faq: [string, string][] = [
    [`What is ${f.name}'s zodiac sign?`,
      summary!.sun.length === 1
        ? `${f.name}'s zodiac (Sun) sign is ${summary!.sun[0]}.`
        : `${f.name} was born on the day the Sun moved from ${summary!.sun[0]} into ${summary!.sun[1]}; without a birth time it could be either.`],
    [`What is ${f.name}'s Moon sign?`,
      summary!.moon.length === 1
        ? f.birth.time
          ? `The Moon was in ${summary!.moon[0]} at the recorded birth time, rated Rodden ${f.rating}.`
          : `The Moon was in ${summary!.moon[0]} for the whole of ${f.name}'s birth day.`
        : `The Moon changed from ${summary!.moon[0]} to ${summary!.moon[1]} on ${f.name}'s birth day, so it depends on the birth time.`],
    [`What is ${f.name}'s Rising sign?`,
      summary!.rising
        ? `${summary!.rising}, from a birth time rated Rodden ${f.rating}.`
        : `Unknown. The Rising sign needs a birth time, and ${f.name}'s is not recorded, so we do not guess it.`],
  ];

  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 sm:px-8 pb-10">
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Person", name: f.name, description: f.blurb,
        birthDate: f.birth.date, birthPlace: { "@type": "Place", name: f.birth.place.label },
        ...(f.wikidata ? { sameAs: `https://www.wikidata.org/wiki/${f.wikidata}` } : {}),
      }} />
      <FamousChart famous={f} chart={chart!} summary={summary!} faq={faq} sameSun={sameSun} sameField={sameField} />
    </main>
  );
}
