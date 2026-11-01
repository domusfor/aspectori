"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Chart, WeekResult, WeekTransit } from "@/lib/astro/types";
import { ASPECT_BY_TYPE } from "@/lib/astro/aspects";
import { POINT_GLYPHS, POINT_NAMES, fmtOrb, fmtPos } from "@/lib/astro/zodiac";
import { weekReading } from "@/lib/astro/week-reading";
import { useRequest } from "@/lib/use-request";
import { fmtDate } from "@/lib/url";

const utcDay = () => new Date().toISOString().slice(0, 10);
const sampleLabel = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

export default function WeeklyHoroscope({ chart }: { chart: Chart }) {
  // The client date only triggers refreshes. The server decides the calculation window.
  const [refreshDay, setRefreshDay] = useState(utcDay);
  useEffect(() => {
    const refresh = () => setRefreshDay(utcDay());
    const interval = window.setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(interval); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  const { data: week, loading, error, retry } = useRequest<WeekResult>("/api/week", { ...chart.input, refreshDay });
  return (
    <section id="week" aria-labelledby="week-heading" className="week-panel my-8 p-5 sm:p-8 scroll-mt-8">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-xl">
          <p className="kicker text-gold">Your free weekly horoscope</p>
          <h2 id="week-heading" className="font-serif text-4xl sm:text-5xl mt-3">Your week ahead</h2>
          <p className="mt-3 text-sm text-ink-2 leading-relaxed">A little perspective for the next seven days. Themes drawn from transits to your birth chart, with a question to make each one your own.</p>
        </div>
        <div className="sm:text-right">
          {week && <p className="text-sm text-gold tabular-nums">{fmtDate(week.from, week.from.slice(0, 4) !== week.to.slice(0, 4))} – {fmtDate(week.to)}<span className="block text-xs text-muted mt-1">Seven calendar days · UTC</span></p>}
          <button type="button" className="btn btn-ghost mt-3" disabled={loading} onClick={retry}>Refresh my week</button>
        </div>
      </header>
      {loading && <div role="status" className="flex items-center gap-4 py-12 text-sm text-ink-2"><span className="spinner" aria-hidden />Finding this week’s transits to your chart…</div>}
      {error && <div role="alert" className="mt-6 rounded-lg border border-line p-5"><p className="text-sm text-tense">{error}</p><button className="btn mt-4" onClick={retry}>Try my week again</button></div>}
      {week && <>
        {!week.timeKnown && <p className="mt-5 text-sm text-gold leading-relaxed">Your birth time is unknown. Moon, Rising and Midheaven themes are left out. Other contacts must meet the 1° limit at both ends of your birth day.</p>}
        {week.transits.length ? <div className="grid gap-4 mt-7 lg:grid-cols-3">
          {week.transits.map((transit, index) => <WeekCard key={`${transit.planet}-${transit.target}-${transit.type}`} transit={transit} week={week} index={index} />)}
        </div> : <div className="mt-7 border border-line rounded-xl p-6"><h3 className="font-serif text-2xl">Room for your own priorities</h3><p className="text-sm text-ink-2 mt-3 leading-relaxed">No contacts met our weekly selection rules in this window. There is no need to invent a theme: choose one thing you would like to give your attention to, and return for a fresh calculation another day.</p></div>}
        <footer className="mt-6 border-t border-line pt-5 grid gap-3 sm:grid-cols-2 text-xs leading-relaxed text-muted">
          <p>Days marked below each theme contain at least one qualifying sample. We check every six hours with a 1° limit; these are sampled dates, not exact start or end times.</p>
          <p>Astrological interpretations are for reflection and entertainment, not predictions. Bookmark your chart link to return to a fresh week. <Link href="/method#week" className="text-gold underline">How we choose the themes</Link>.</p>
        </footer>
      </>}
    </section>
  );
}

function WeekCard({ transit, week, index }: { transit: WeekTransit; week: WeekResult; index: number }) {
  const reading = weekReading(transit);
  const aspect = ASPECT_BY_TYPE[transit.type];
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(`${week.from}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + i);
    return { iso: date.toISOString().slice(0, 10), label: date.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" }), number: date.getUTCDate() };
  });
  return (
    <article className="week-card p-5" style={{ "--week-accent": reading.color } as React.CSSProperties}>
      <div className="flex items-center justify-between gap-3"><p className="kicker" style={{ color: reading.color }}>{reading.label}</p><span className="font-serif text-2xl text-muted" aria-hidden>0{index + 1}</span></div>
      <div className="week-symbols mt-5" aria-hidden><span>{POINT_GLYPHS[transit.planet]}</span><span className="text-xl opacity-60">{aspect.symbol}</span><span>{POINT_GLYPHS[transit.target]}</span></div>
      <p className="text-xs text-ink-2 mt-3">{POINT_NAMES[transit.planet]} {aspect.verb3} your {POINT_NAMES[transit.target]}</p>
      <h3 className="font-serif text-2xl leading-tight mt-3">{reading.title}</h3>
      <p className="text-sm text-ink-2 leading-relaxed mt-4">{reading.interpretation}</p>
      <p className="text-sm text-ink-2 leading-relaxed mt-3">{reading.aspect}</p>
      <div className="week-question mt-5 p-4"><p className="kicker mb-2" style={{ color: reading.color }}>A question to carry</p><p className="text-sm leading-relaxed">{reading.prompt}</p></div>
      <div className="mt-auto pt-6">
        <p className="text-xs text-ink-2 mb-3">Sampled contact days · UTC</p>
        <ol className="week-days" aria-label="Days with qualifying transit samples">
          {days.map((day) => <li key={day.iso} className={transit.activeDates.includes(day.iso) ? "is-active" : ""} aria-label={`${fmtDate(day.iso)}: ${transit.activeDates.includes(day.iso) ? "qualifying sample" : "no qualifying sample"}`}><span>{day.label}</span><strong>{day.number}</strong><span aria-hidden className="week-day-dot" /></li>)}
        </ol>
        <details className="mt-5 text-xs text-ink-2 leading-relaxed">
          <summary className="text-gold cursor-pointer min-h-11 flex items-center">Show the calculation <span aria-hidden className="ml-2">+</span></summary>
          <dl className="week-evidence">
            <dt>Closest sampled time</dt><dd>{sampleLabel(transit.closestAt)} UTC</dd>
            <dt>Transiting {POINT_NAMES[transit.planet]}</dt><dd>{fmtPos(transit.transitLon)}</dd>
            <dt>Your {POINT_NAMES[transit.target]}{week.timeKnown ? "" : " · birth-day endpoints"}</dt><dd>{transit.natalLongitudes.map(fmtPos).join(" / ")}</dd>
            <dt>Aspect angle</dt><dd>{aspect.angle}° · {transit.type}</dd>
            <dt>Orb at the natal sample{week.timeKnown ? "" : "s"}</dt><dd>{fmtOrb(transit.minOrb)}{!week.timeKnown && ` – ${fmtOrb(transit.maxOrb)}`} · limit {week.orbLimit}°</dd>
          </dl>
          <p className="mt-3">“Closest” means the smallest sampled orb{week.timeKnown ? "" : " at the less certain endpoint"}. It does not claim an exact pass between samples.</p>
        </details>
      </div>
    </article>
  );
}
