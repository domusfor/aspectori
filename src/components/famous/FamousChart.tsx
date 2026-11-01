"use client";

import Link from "next/link";
import { RATING_LABEL, type Famous } from "@/data/famous";
import { comboSlug } from "@/lib/astro/signs";
import type { Chart } from "@/lib/astro/types";
import type { FamousSummary } from "@/lib/famous-summary";
import { encodeBirth, fmtDate } from "@/lib/url";
import ChartView from "../ChartView";
import { SectionHead } from "../Reading";
import Reveal from "../Reveal";
import Crumbs from "../seo/Crumbs";
import PersonCard from "./PersonCard";

interface Props {
  famous: Famous;
  chart: Chart;
  summary: FamousSummary;
  faq: [string, string][];
  sameSun: FamousSummary[];
  sameField: FamousSummary[];
}

export default function FamousChart({ famous: f, chart, summary, faq, sameSun, sameField }: Props) {
  const compare = new URLSearchParams({ p: encodeBirth(f.birth), pn: f.name, rel: "famous" }).toString();
  const sun = summary.sun.length === 1 ? summary.sun[0] : null;
  const moon = summary.moon.length === 1 ? summary.moon[0] : null;
  return (
    <>
      <Crumbs items={[["Home", "/"], ["Famous charts", "/charts"], [f.category, `/charts/category/${f.category.toLowerCase()}`], [f.name, `/charts/${f.slug}`]]} />
      <header className="pt-6 pb-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="rise kicker text-gold">{f.category} · birth chart</p>
          <h1 className="rise font-serif text-5xl sm:text-6xl font-medium leading-[1.02] mt-3" style={{ "--i": 1 } as React.CSSProperties}>
            {f.name}
          </h1>
          <p className="rise mt-4 max-w-xl text-ink-2 leading-relaxed" style={{ "--i": 2 } as React.CSSProperties}>{f.blurb}</p>
          <p className="rise mt-3 text-sm text-muted" style={{ "--i": 3 } as React.CSSProperties}>
            Born {fmtDate(f.birth.date)}{f.birth.time ? `, ${f.birth.time.slice(0, 5)} local time` : ""}, {f.birth.place.label}.
            <br />
            <span className="text-gold">Rodden {f.rating}</span> · {RATING_LABEL[f.rating]} · Source: {f.source}
          </p>
        </div>
        <Link href={`/#${compare}`} className="rise btn btn-solid self-start md:self-end" style={{ "--i": 4 } as React.CSSProperties}>
          Compare with my chart
        </Link>
      </header>

      <ChartView chart={chart} title={f.name} fileName={`${f.slug}-aspectori.png`} sections={[{ id: "glance", label: "At a glance" }]}>
        <Reveal as="section" id="glance" className="scroll-mt-16">
          <SectionHead kicker="At a glance" title={`${f.name}'s signs`} />
          <dl className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {faq.map(([q, a]) => (
              <div key={q} className="py-4">
                <dt className="font-serif text-xl font-medium">{q}</dt>
                <dd className="mt-1 text-ink-2 leading-relaxed">{a}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            {sun && <Chip href={`/zodiac/${sun.toLowerCase()}`}>More about {sun}</Chip>}
            {sun && moon && <Chip href={`/zodiac/${comboSlug(sun, moon)}`}>{sun} Sun, {moon} Moon</Chip>}
          </div>
        </Reveal>

        {sameSun.length > 0 && sun && (
          <Reveal as="section">
            <SectionHead kicker="Same Sun sign" title={`Other famous ${sun}s`} />
            <div className="grid gap-4 sm:grid-cols-2">
              {sameSun.slice(0, 4).map((o, i) => <PersonCard key={o.slug} p={o} i={i} />)}
            </div>
          </Reveal>
        )}

        {sameField.length > 0 && (
          <Reveal as="section">
            <SectionHead kicker="Same field" title={`More ${f.category.toLowerCase()} charts`} />
            <div className="grid gap-4 sm:grid-cols-2">
              {sameField.map((o, i) => <PersonCard key={o.slug} p={o} i={i} />)}
            </div>
          </Reveal>
        )}
      </ChartView>
    </>
  );
}

function Chip({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="caps !text-[0.6rem] rounded-full border border-[var(--line)] px-3.5 py-1.5 text-muted hover:border-[var(--gold)] hover:text-ink">
      {children}
    </Link>
  );
}
