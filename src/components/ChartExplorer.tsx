"use client";

import Link from "next/link";
import { ASPECT_BY_TYPE } from "@/lib/astro/aspects";
import { aspectTitle } from "@/lib/astro/library";
import { aspectRef } from "@/lib/astro/reading";
import type { Chart, HouseSystem } from "@/lib/astro/types";
import { POINT_NAMES, SLOW } from "@/lib/astro/zodiac";
import { explainChartRef } from "@/lib/chart-explanation";

export default function ChartExplorer({ chart, system, active, onSelect, onSystem }: {
  chart: Chart; system: HouseSystem; active: string | null;
  onSelect: (ref: string) => void; onSystem: (system: HouseSystem) => void;
}) {
  const explanation = explainChartRef(chart, system, active ?? "sun") ?? explainChartRef(chart, system, "sun")!;
  const { entry } = explanation;
  const aspects = chart.aspects.filter((a) => !(SLOW.has(a.a) && SLOW.has(a.b)));
  return <section id="chart-explorer" aria-labelledby="chart-explorer-title" className="panel p-5 sm:p-7 scroll-mt-6">
    <p className="kicker text-gold">Start with one piece</p>
    <h2 id="chart-explorer-title" tabIndex={-1} className="font-serif text-3xl sm:text-4xl mt-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">Make sense of your chart</h2>
    <p className="text-sm text-ink-2 leading-relaxed mt-3">Start with the Sun for self-expression, the Moon for comfort, and Rising for your first approach. Then explore another symbol or a line between points.</p>
    <div className="flex flex-wrap gap-2 mt-5" aria-label="Start with the big three">
      {(["sun", "moon", "asc"] as const).map((id) => <button key={id} className={`topic-chip ${entry.ref === id ? "is-active" : ""}`} aria-pressed={entry.ref === id} disabled={!chart.points.some((p) => p.id === id)} onClick={() => onSelect(id)}>{POINT_NAMES[id]}{id === "asc" && !chart.timeKnown ? " · needs a time" : ""}</button>)}
    </div>
    <div className="grid gap-4 mt-5">
      <label className="grid gap-2 text-sm text-ink-2">Explore a placement or aspect
        <select className="field w-full min-h-12 text-base" value={entry.ref} onChange={(event) => onSelect(event.target.value)}>
          <optgroup label="Placements">{chart.points.map((p) => <option key={p.id} value={p.id}>{POINT_NAMES[p.id]}</option>)}</optgroup>
          <optgroup label="Aspects">{aspects.map((a) => <option key={aspectRef(a)} value={aspectRef(a)} aria-label={aspectTitle(a)}>{POINT_NAMES[a.a]} {ASPECT_BY_TYPE[a.type].symbol} {POINT_NAMES[a.b]}</option>)}</optgroup>
        </select>
      </label>
      {chart.timeKnown && chart.cusps?.placidus && <label className="grid gap-2 text-sm text-ink-2">House system for this reading
        <select className="field w-full min-h-12 text-base" value={system} onChange={(event) => onSystem(event.target.value as HouseSystem)}><option value="placidus">Placidus</option><option value="whole">Whole sign</option></select>
      </label>}
    </div>
    <div role="region" aria-label="Selected chart explanation" aria-live="polite" aria-atomic="true" className="mt-6 border-t border-line pt-5">
      <h3 className="font-serif text-2xl sm:text-3xl">{entry.title}</h3>
      <p className="text-sm text-ink-2 leading-relaxed mt-3">{explanation.theme}</p>
      <h4 className="kicker text-gold mt-5">What was calculated</h4>
      <dl className="mt-3 grid gap-3">{entry.evidence.map((e) => <div key={e.label} className="rounded border border-line p-3 text-sm leading-relaxed">
        <dt className="text-gold"><span className="glyph mr-2" aria-hidden>{e.glyph}{"︎"}</span>{e.label}</dt>
        <dd className="mt-1">{e.position}</dd>{e.house && <dd className="text-ink-2">{e.house}</dd>}{e.note && <dd className="text-ink-2">{e.note}</dd>}
      </div>)}</dl>
      {explanation.geometry && <p className="text-sm text-ink-2 leading-relaxed mt-3">{explanation.geometry}</p>}
      {explanation.uncertainty && <p className="text-sm text-gold leading-relaxed mt-3">{explanation.uncertainty}</p>}
      {chart.timeKnown && !chart.cusps?.placidus && <p className="text-sm text-gold leading-relaxed mt-3">Placidus is unavailable at this latitude. This reading uses whole sign houses.</p>}
      <h4 className="kicker text-gold mt-6">Traditional interpretation</h4>
      <p className="text-xs text-muted leading-relaxed mt-2">These are symbolic themes to consider, not established facts about your personality.</p>
      {entry.lines.map((line) => <p key={line} className="text-sm leading-relaxed text-ink-2 mt-3">{line}</p>)}
      <div className="mt-5 border-l-2 border-gold pl-4"><p className="text-xs text-gold">Try it against your experience</p><p className="text-sm leading-relaxed mt-2">{explanation.prompt}</p></div>
    </div>
    <details className="mt-6 border-t border-line pt-2"><summary className="min-h-11 flex items-center cursor-pointer text-sm text-gold">Why can different parts of my chart sound different?</summary><p className="text-sm text-ink-2 leading-relaxed mt-2">The Sun, Moon and Rising describe different symbolic themes. A wish to be visible and a need for privacy can coexist. Read each theme in its context and look for examples and counterexamples from your own life. No single placement describes the whole person.</p></details>
    <details className="mt-2"><summary className="min-h-11 flex items-center cursor-pointer text-sm text-gold">How do I read the circle and symbols?</summary><p className="text-sm text-ink-2 leading-relaxed mt-2">The outer ring contains twelve signs. Ticks mark plotted positions; a planet label may move slightly to avoid crowding, with a leader pointing back to its tick. The numbered sectors are houses. Lines across the centre show selected aspects. The rings are diagram guides, not physical orbits.</p><p className="text-sm text-ink-2 leading-relaxed mt-3">For an unknown birth time, ticks use the midpoint of the two endpoint samples. They do not represent an exact birth position. Some selectable aspects are not drawn, to keep the wheel readable.</p></details>
    <Link href="/learn/how-to-read-a-birth-chart" className="inline-flex items-center min-h-11 mt-3 text-sm text-gold underline">Read the full chart-reading guide</Link>
  </section>;
}
