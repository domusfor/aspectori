import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Crumbs from "@/components/seo/Crumbs";
import JsonLd, { siteUrl } from "@/components/seo/JsonLd";
import { CORE_GUIDES, GUIDES, guideBySlug, type Guide } from "@/data/guides";
import { PersonRow } from "@/components/famous/PersonCard";
import { allSummaries } from "@/lib/famous-summary";
import { fmtDate } from "@/lib/url";
import { SIGNS } from "@/lib/astro/zodiac";
import RouteLoading from "@/components/site/RouteLoading";
export function generateStaticParams() { return GUIDES.map(({ slug }) => ({ slug })); }
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const guide = guideBySlug((await params).slug); return guide ? { title: guide.title, description: guide.description, alternates: { canonical: `/learn/${guide.slug}` } } : {}; }
export default function Page({ params }: Props) {
  return <Suspense fallback={<RouteLoading label="guide" />}><GuidePage params={params} /></Suspense>;
}
const DEFAULT_PUBLISHED = "2026-10-18";

/** Nearby guides rather than the whole library: the opposite Rising sign, its neighbors and the basics. */
function relatedGuides(guide: Guide) {
  if (!guide.rising) return GUIDES.filter((other) => other.slug !== guide.slug && !other.rising);
  const i = SIGNS.indexOf(guide.rising);
  const near = [i + 6, i + 1, i + 11].map((n) => `${SIGNS[n % 12].toLowerCase()}-rising`);
  return [...near.map((slug) => guideBySlug(slug)!), ...CORE_GUIDES.filter((other) => ["how-to-read-a-birth-chart", "birth-chart-houses-explained"].includes(other.slug))];
}

async function RisingExamples({ guide }: { guide: Guide }) {
  const people = (await allSummaries()).filter((p) => p.rising === guide.rising && p.rating !== "X" && p.rating !== "C");
  if (!people.length) return null;
  return <section className="mt-10"><h2 className="font-serif text-3xl">Famous {guide.rising} Rising charts</h2><p className="mt-3 text-sm text-ink-2">From recorded birth times rated Rodden AA, A or B. Open a chart to see its source.</p><ul className="mt-4">{people.map((p) => <PersonRow key={p.slug} p={p} />)}</ul></section>;
}

async function GuidePage({ params }: Props) {
  const guide = guideBySlug((await params).slug); if (!guide) notFound();
  return <main className="mx-auto max-w-3xl px-4 sm:px-8 pb-12"><Crumbs items={[["Home", "/"], ["Learn", "/learn"], [guide.title, `/learn/${guide.slug}`]]} /><article><header className="py-9"><p className="kicker text-gold">Aspectori guide · {fmtDate(guide.published ?? DEFAULT_PUBLISHED)}</p><h1 className="font-serif text-4xl sm:text-5xl mt-4 leading-tight">{guide.title}</h1><p className="mt-5 text-lg text-ink-2 leading-relaxed">{guide.summary}</p><Link className="btn btn-solid mt-6" href={`/calculators/${guide.tool}`}>Try it with your chart</Link></header><nav aria-label="In this guide" className="panel p-5"><p className="kicker text-gold mb-3">In this guide</p><ol className="grid gap-2 text-sm">{guide.sections.map((section, i) => <li key={section.title}><a className="underline underline-offset-4 text-ink-2" href={`#section-${i + 1}`}>{section.title}</a></li>)}</ol></nav>{guide.sections.map((section, i) => <section key={section.title} id={`section-${i + 1}`} className="mt-10 scroll-mt-8"><h2 className="font-serif text-3xl">{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 text-ink-2 leading-relaxed">{paragraph}</p>)}</section>)}{guide.rising && <RisingExamples guide={guide} />}{guide.rising && <nav aria-label="Tools for this guide" className="mt-8 flex flex-wrap gap-x-6 text-sm text-gold"><Link className="inline-flex min-h-11 items-center underline" href="/calculators/birth-time-explorer">Birth Time Explorer</Link><Link className="inline-flex min-h-11 items-center underline" href="/calculators/chart-ruler">Chart ruler calculator</Link><Link className="inline-flex min-h-11 items-center underline" href={`/zodiac/${guide.rising.toLowerCase()}`}>{guide.rising} as a Sun and Moon sign</Link></nav>}<section className="mt-12 border-t border-line pt-6"><h2 className="font-serif text-2xl">Sources and method</h2><ul className="mt-4 grid gap-3 text-sm text-gold">{guide.sources.map(([label, href]) => <li key={href}><a className="underline underline-offset-4" href={href}>{label}</a></li>)}</ul><p className="mt-5 text-sm text-muted">Published by Aspectori. Calculation statements describe the current tool and its tests. Interpretations describe astrological conventions, not scientifically established predictions. See our <Link className="underline" href="/method">method</Link> and <Link className="underline" href="/accuracy">accuracy limits</Link>.</p></section></article><nav aria-label="Related guides" className="mt-12 panel p-6"><h2 className="font-serif text-2xl mb-4">Keep exploring</h2><ul className="grid gap-3 text-sm text-gold">{relatedGuides(guide).map((other) => <li key={other.slug}><Link href={`/learn/${other.slug}`} className="underline">{other.title}</Link></li>)}</ul></nav><JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: guide.description, datePublished: guide.published ?? DEFAULT_PUBLISHED, author: { "@type": "Organization", name: "Aspectori", url: siteUrl }, publisher: { "@id": `${siteUrl}/#org` }, mainEntityOfPage: `${siteUrl}/learn/${guide.slug}` }} /></main>;
}
