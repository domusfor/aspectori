"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Chart, CoupleResult, HouseSystem, YearResult } from "@/lib/astro/types";
import { decodeBirth } from "@/lib/url";
import { useHash } from "@/lib/use-hash";
import { useRequest } from "@/lib/use-request";
import { buildReport } from "@/lib/report";
import Wheel from "./Wheel";
import { elementBalance, REFLECTIONS } from "@/lib/chart-insights";
import { buildReading, positionLabel, signsOf } from "@/lib/astro/reading";
import { POINT_NAMES } from "@/lib/astro/zodiac";
import { relationshipOf } from "@/lib/comparison-reading";

export default function Report() {
  const hash = useHash();
  const params = new URLSearchParams(hash ?? "");
  const birth = decodeBirth(params.get("b"));
  const partner = decodeBirth(params.get("p"));
  const natal = useRequest<Chart>("/api/chart", birth);
  const year = useRequest<YearResult>("/api/year", birth);
  const couple = useRequest<CoupleResult>("/api/couple", birth && partner ? { a: birth, b: partner } : null);
  const wheel = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [exportError, setExportError] = useState("");

  if (hash === null) return <p role="status" className="p-10 text-center text-muted">Opening your report…</p>;
  if (!birth) return <main className="mx-auto max-w-xl px-4 py-16 text-center"><h1 className="font-serif text-4xl">Your free birth chart report</h1><p role="alert" className="mt-5 text-ink-2">Create a chart first, then open its free PDF report. No account or email needed.</p><Link href="/" className="btn btn-solid mt-6">Create my chart</Link><Link href="/birth-chart-report" className="block mt-5 text-gold underline">See what the report includes</Link></main>;
  if (natal.error) return <main className="p-10 text-center"><p role="alert" className="text-tense">{natal.error}</p><button className="btn mt-5" onClick={natal.retry}>Retry report</button></main>;
  if (!natal.data) return <p role="status" className="p-10 text-center text-muted">Calculating your report…</p>;

  const chart = natal.data;
  const system: HouseSystem = params.get("hs") === "whole" || !chart.cusps?.placidus ? "whole" : "placidus";
  const comparison = couple.data ? { result: couple.data, name: (params.get("pn") || "Your person").slice(0, 40), relationship: relationshipOf(params.get("rel")) } : undefined;
  const report = buildReport(chart, year.data, system, comparison);
  const balance = elementBalance(chart);
  const reading = buildReading(chart, system);
  const save = async () => {
    if (saving) return;
    setSaving(true); setExportError("");
    try { const { downloadReport } = await import("@/lib/report-pdf"); await downloadReport(chart, year.data, system, wheel.current, comparison); }
    catch (error) { setExportError(error instanceof Error ? error.message : "The PDF could not be created. Try again or use Print / save PDF."); }
    finally { setSaving(false); }
  };
  return (
    <main className="paper report-atlas min-h-dvh">
      <div className="mx-auto max-w-[960px] px-5 sm:px-10 py-10 print:p-0">
        <div className="no-print mb-8">
          <Link href={`/#${params}`} className="text-sm underline underline-offset-4">← Back to chart & connections</Link>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn btn-solid" disabled={saving || year.loading || couple.loading} onClick={save}>{saving ? "Designing your atlas…" : year.loading || couple.loading ? "Preparing your report…" : couple.error ? "Download natal PDF only" : "Download free PDF"}</button>
            <button className="btn" onClick={() => window.print()}>Print / save PDF</button>
          </div>
          <p className="mt-3 text-sm">Free now. No account, email, or payment required. The PDF is created on your device.</p>
          {year.loading && <p role="status" className="mt-2 text-sm">Your natal chart is ready. Calculating the dated transits…</p>}
          {year.error && <div role="alert" className="mt-3 text-sm">The year ahead could not be loaded. You can download your natal report now or <button className="underline" onClick={year.retry}>retry the year</button>.</div>}
          {couple.error && <div role="alert" className="mt-3 text-sm">The comparison could not be loaded and will not be included in this download. <button className="underline" onClick={couple.retry}>Retry comparison</button> or download your natal report only.</div>}
          {exportError && <p role="alert" className="mt-3 text-sm text-tense">{exportError}</p>}
        </div>
        <header className="report-cover p-6 sm:p-10 rounded-xl">
          <div><p className="kicker !text-[#e2c58d]">Aspectori / Your personal atlas</p><h1 className="mt-5 font-serif text-5xl sm:text-7xl leading-[1.02]">The shape<br /><em className="text-[#e2c58d]">of your sky.</em></h1><p className="mt-5 text-base text-[#e4e0d7]">{report.title}</p><p className="mt-4 text-xs text-[#b8c2d0]">{chart.moment.localLabel} · {chart.input.place.label}</p>{comparison && <p className="text-sm text-[#e2c58d] mt-4">Includes your connection with {comparison.name}</p>}</div>
          <div className="report-wheel-shell mt-8 sm:mt-0"><div ref={wheel} className="paper rounded-lg w-full max-w-[380px] mx-auto"><Wheel chart={chart} sys={system} className="w-full" /></div></div>
        </header>
        <section className="mt-10"><p className="kicker text-gold">Your chart at a glance</p><div className="grid sm:grid-cols-3 gap-3 mt-4">{(["sun", "moon", "asc"] as const).map((id) => { const point = chart.points.find((p) => p.id === id); return <div key={id} className="report-anchor p-5 rounded-lg"><p className="kicker text-gold">{POINT_NAMES[id]}</p><h2 className="font-serif text-3xl mt-2">{point ? signsOf(point).join(" or ") : "Unknown"}</h2><p className="text-xs text-ink-2 mt-2">{point ? positionLabel(point) : "A birth time is needed."}</p></div>; })}</div><div className="grid sm:grid-cols-2 gap-5 mt-7">{balance.elements.map((element) => <div key={element.name}><div className="flex justify-between gap-3 text-sm"><span>{element.name} <span className="text-muted text-xs">· {element.theme}</span></span><strong>{element.count}</strong></div><div className="mt-2 h-1.5 bg-[#e2ddd3] rounded-full"><div className="h-full rounded-full" style={{ width: `${element.count * 10}%`, background: element.color }} /></div></div>)}</div><p className="text-xs text-muted mt-4">Equal counts of the ten planets, Sun through Pluto. {balance.uncertain ? `${balance.uncertain} uncertain sign placement(s) are excluded.` : "All ten can be assigned to an element."} Placement counts are not personality percentages.</p></section>
        {report.sections.map((section, index) => (
          <section key={section.title} className="mt-10">
            <h2 className="font-serif text-2xl border-b border-[var(--line-2)] pb-2 mb-4 break-after-avoid"><span className="text-gold mr-3">0{index + 1}</span>{section.title}</h2>
            {section.title === "Planetary placements" ? <div className="table-scroll overflow-x-auto" role="region" aria-label="Report planetary placements" tabIndex={0}><table className="w-full text-left text-xs sm:text-sm"><thead><tr className="border-b border-line"><th className="py-3 pr-3">Point</th><th className="py-3 pr-3">Sign & degree</th><th className="py-3 px-2">Placidus</th><th className="py-3 pl-2">Whole</th></tr></thead><tbody>{chart.points.map((point) => <tr key={point.id} className="border-b border-line"><th className="py-3 pr-3 font-medium">{POINT_NAMES[point.id]}</th><td className="py-3 pr-3 min-w-32">{positionLabel(point)}</td><td className="py-3 px-2">{point.houses?.placidus ?? "—"}</td><td className="py-3 pl-2">{point.houses?.whole ?? "—"}</td></tr>)}</tbody></table></div> : section.title === "Your reading" ? <div className="grid sm:grid-cols-2 gap-4">{[...reading.lead, ...reading.rest].map((entry) => { const point = chart.points.find((p) => p.id === entry.ref); return <article key={entry.ref} className="report-reading-card rounded-lg p-5 break-inside-avoid"><h3 className="font-serif text-2xl">{entry.title}</h3>{entry.lines.map((line) => <p key={line} className="text-sm leading-relaxed mt-3 text-ink-2">{line}</p>)}<p className="text-xs text-muted leading-relaxed mt-4 border-t border-line pt-3">{entry.evidence.map((e) => `${e.label}: ${e.position}${e.house ? ` · ${e.house}` : ""}`).join("; ")}</p>{point && <p className="text-xs leading-relaxed text-gold mt-4"><strong>Reflect / </strong>{REFLECTIONS[point.id]}</p>}</article>; })}</div> : <div className="grid gap-3">{section.paragraphs.map((paragraph, i) => <p key={i} className="text-sm leading-relaxed break-inside-avoid">{paragraph}</p>)}</div>}
          </section>
        ))}
        <footer className="mt-12 pt-5 border-t border-[var(--line-2)] text-xs text-muted">Aspectori · Swiss Ephemeris · <Link href="/method" className="underline">Method</Link> · <Link href="/accuracy" className="underline">Accuracy reference</Link></footer>
      </div>
    </main>
  );
}
