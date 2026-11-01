import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CALCULATORS, calculatorBySlug } from "@/data/calculators";
import FocusedCalculator from "@/components/FocusedCalculator";
import Crumbs from "@/components/seo/Crumbs";
import JsonLd, { siteUrl } from "@/components/seo/JsonLd";
import RouteLoading from "@/components/site/RouteLoading";
export function generateStaticParams() { return CALCULATORS.map(({ slug }) => ({ slug })); }
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = calculatorBySlug((await params).slug);
  return tool ? { title: tool.title, description: tool.description, alternates: { canonical: `/calculators/${tool.slug}` }, openGraph: { title: tool.title, description: tool.description, url: `/calculators/${tool.slug}` } } : {};
}
export default function Page({ params }: Props) {
  return <Suspense fallback={<RouteLoading label="calculator" />}><CalculatorPage params={params} /></Suspense>;
}
async function CalculatorPage({ params }: Props) {
  const tool = calculatorBySlug((await params).slug);
  if (!tool) notFound();
  return <main className="mx-auto max-w-[1120px] px-4 sm:px-8 pb-12"><Crumbs items={[["Home", "/"], ["Calculators", "/calculators"], [tool.title, `/calculators/${tool.slug}`]]} /><header className="max-w-3xl py-10"><p className="kicker text-gold">Free · No account needed</p><h1 className="font-serif text-4xl sm:text-6xl mt-4 leading-tight">{tool.title}</h1><p className="mt-5 text-lg text-ink-2 leading-relaxed">{tool.intro}</p></header><FocusedCalculator mode={tool.mode} /><div className="grid gap-8 mt-16 md:grid-cols-3">{tool.sections.map((section) => <section key={section.title}><h2 className="font-serif text-2xl">{section.title}</h2><p className="text-sm text-ink-2 leading-relaxed mt-3">{section.text}</p></section>)}</div><section className="mt-14 max-w-3xl"><h2 className="font-serif text-3xl">Common questions</h2><div className="divide-y divide-line mt-5">{tool.faq.map(([question, answer]) => <details className="py-5" key={question}><summary className="cursor-pointer text-lg">{question}</summary><p className="mt-3 text-ink-2 leading-relaxed">{answer}</p></details>)}</div><p className="text-sm text-muted mt-6">Method: tropical zodiac, geocentric positions, historical local time zones. {tool.mode === "synastry" && "Synastry uses 75% of the natal major-aspect orbs and excludes slow-planet pairs. "}Astrology is an interpretive tradition, not a validated personality or relationship test.</p>{tool.sources && <div className="mt-5"><h3 className="text-sm text-ink-2">Sources & method references</h3><ul className="text-sm text-gold space-y-2 mt-3">{tool.sources.map(([label, href]) => <li key={href}><a href={href} className="underline">{label}</a></li>)}</ul></div>}<nav aria-label="Further reading" className="flex flex-wrap gap-5 mt-6 text-sm text-gold"><Link href={`/learn/${tool.guide}`} className="underline">Read the guide</Link><Link href="/accuracy" className="underline">Check the accuracy reference</Link><Link href="/birth-chart-report" className="underline">Explore the free PDF report</Link><Link href="/calculators" className="underline">All calculators</Link></nav></section><JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", name: tool.title, description: tool.description, url: `${siteUrl}/calculators/${tool.slug}`, applicationCategory: "LifestyleApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: 0, priceCurrency: "USD" } }} /></main>;
}
