"use client";

import { useState } from "react";
import Link from "next/link";
import type { BirthInput, Chart, YearResult } from "@/lib/astro/types";
import { decodeBirth, encodeBirth } from "@/lib/url";
import { setHash, useHash } from "@/lib/use-hash";
import BirthForm from "./BirthForm";
import ChartView from "./ChartView";
import ComparisonHub from "./ComparisonHub";
import { signsOf } from "@/lib/astro/reading";
import { POINT_NAMES } from "@/lib/astro/zodiac";
import { useRequest } from "@/lib/use-request";
import { SectionHead } from "./Reading";
import Reveal from "./Reveal";
import Year from "./Year";
import WeeklyHoroscope from "./WeeklyHoroscope";
import ChartToolLinks from "./ChartToolLinks";
import HeroSky from "./home/HeroSky";
import Horizon from "./home/Horizon";

const OFFSET_SOURCE = { tz: "historical time zone", lmt: "local mean time", manual: "set by hand" } as const;

export default function App({ home }: { home?: React.ReactNode }) {
  const hash = useHash();
  const params = new URLSearchParams(hash ?? "");
  const birthKey = params.get("b");
  const partnerKey = params.get("p");
  const partnerName = params.get("pn");
  const birth = decodeBirth(birthKey);
  const partner = decodeBirth(partnerKey);

  const chartRequest = useRequest<Chart>("/api/chart", birth);
  const [yearFor, setYearFor] = useState<string | null>(null);
  const yearRequest = useRequest<YearResult>("/api/year", yearFor === birthKey ? birth : null);
  const [editing, setEditing] = useState(false);
  const { data: chart, loading: chartBusy } = chartRequest;
  const { data: year, loading: yearBusy } = yearRequest;

  const setParam = (key: "b" | "p", value: BirthInput | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, encodeBirth(value));
    else next.delete(key);
    if (key === "p") next.delete("pn");
    setHash(next);
  };

  const loadYear = () => {
    if (yearRequest.error) yearRequest.retry();
    else setYearFor(birthKey);
  };

  // On the server (hash === null) this renders the landing page, so search engines see it.
  const showForm = !birth || editing || (!chart && !chartBusy);

  const landing = showForm && !birth && !editing;

  return (
    <main id="main-content" tabIndex={-1}>
      {showForm && (
        <Hero partnerName={partner ? partnerName ?? "them" : null} full={landing}>
          <BirthForm
            key={birthKey ?? "new"}
            initial={birth}
            submitLabel={partner && partnerName ? `Compare with ${partnerName}` : "Draw my chart"}
            busy={chartBusy}
            onSubmit={(b) => { if (encodeBirth(b) === birthKey) chartRequest.retry(); setParam("b", b); setEditing(false); window.scrollTo({ top: 0 }); }}
          />
          {editing && <button className="mt-4 text-sm text-gold underline" onClick={() => setEditing(false)}>Cancel editing</button>}
          {birthKey && !birth && <p role="alert" className="mt-4 text-sm text-tense">This chart link contains invalid birth details. Enter them again to create a new chart.</p>}
          {chartRequest.error && <div role="alert" className="mt-4 text-sm text-tense">{chartRequest.error} <button className="text-gold underline" onClick={chartRequest.retry}>Try again</button></div>}
        </Hero>
      )}
      {landing && !partner && home}

    <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-8 pb-10">
      {!showForm && !chart && (
        <div role="status" aria-live="polite" className="flex min-h-[60vh] flex-col items-center justify-center gap-5">
          <div className="spinner" />
          <p className="kicker text-muted">Reading the sky</p>
        </div>
      )}

      {chart && !editing && (<>
        <header className="result-intro mt-7 p-6 sm:p-9">
          <div><p className="kicker text-gold">Your personal sky</p><h1 className="font-serif text-4xl sm:text-5xl mt-3">Your chart. Your connections.</h1><p className="text-sm text-ink-2 mt-3">{chart.moment.localLabel} · {chart.input.place.label}</p></div>
          <div className="flex flex-wrap gap-2 mt-5">{chart.points.filter((p) => ["sun", "moon", "asc"].includes(p.id)).map((p) => <span className="match-reason" key={p.id}>{signsOf(p).join(" or ")} {POINT_NAMES[p.id]}</span>)}</div>
          <button type="button" onClick={() => document.getElementById("your-chart")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })} className="inline-flex items-center min-h-11 text-sm text-gold underline mt-4">Explore your full birth chart ↓</button>
        </header>
        <ChartToolLinks birth={chart.input} />
        <WeeklyHoroscope key={`week-${birthKey}`} chart={chart} />
        <ComparisonHub key={birthKey} chart={chart} />
        <div id="your-chart" className="scroll-mt-8 border-t border-line pt-10">
        <ChartView
          key={birthKey}
          chart={chart}
          fileName="aspectori-card.png"
          sections={[{ id: "week", label: "Week" }, { id: "couple", label: "Compare" }, { id: "year", label: "Year" }]}
          cardFooter={
            <>
              <button className="btn btn-ghost" onClick={() => setEditing(true)}>Edit</button>
              <p className="basis-full mt-2 text-center text-xs text-muted leading-relaxed">
                {chart.moment.localLabel} · {chart.input.place.label}
                <br />
                {chart.moment.offset} · {OFFSET_SOURCE[chart.moment.offsetSource]}
              </p>
              {chart.notes.map((n) => <p key={n} className="basis-full text-center text-xs text-gold">{n}</p>)}
            </>
          }
        >
          <Reveal as="section" id="year" className="scroll-mt-16">
            <SectionHead kicker="The next twelve months" title="This year is a calendar, not a horoscope">
              Six dated transits to your actual chart: the planet, the point it hits, and when. Bookmark this page. The
              address holds your chart, so nothing is stored on our side.
            </SectionHead>
            {yearRequest.error && <p role="alert" className="mb-4 text-sm text-tense">{yearRequest.error}</p>}
            {year ? (
              <Year chart={chart} year={year} />
            ) : (
              <button className="btn" onClick={loadYear} disabled={yearBusy}>
                {yearBusy ? "Scanning the year…" : yearRequest.error ? "Try my year again" : "Show my year"}
              </button>
            )}
          </Reveal>
        </ChartView></div>
      </>)}
    </div>
    </main>
  );
}

function Hero({ children, partnerName, full }: { children: React.ReactNode; partnerName: string | null; full: boolean }) {
  return (
    <section className={`relative isolate overflow-hidden ${full ? "md:min-h-[min(calc(100dvh-72px),860px)]" : ""}`}>
      {full && <HeroSky />}
      <div className="relative z-10 mx-auto grid w-full max-w-[1120px] items-center gap-10 px-4 pb-40 pt-6 sm:px-8 md:grid-cols-[1.15fr_1fr] md:gap-14 md:pb-56 md:pt-10">
        <div>
          {partnerName ? (
            <>
              <p className="rise kicker text-gold">Compatibility</p>
              <h1 className="rise font-serif text-5xl sm:text-6xl font-medium leading-[1.02] mt-4 text-balance" style={{ "--i": 1 } as React.CSSProperties}>
                You and {partnerName}: explore your connection.
              </h1>
              <p className="rise mt-5 text-ink-2 leading-relaxed max-w-md" style={{ "--i": 2 } as React.CSSProperties}>
                Enter your birth details once. Explore your chart and the planetary contacts between you, with clear explanations and questions to reflect on.
              </p>
            </>
          ) : (
            <>
              <p className="rise kicker text-gold">Free birth chart calculator · exact to the degree</p>
              <h1 className="rise font-serif text-[2.9rem] sm:text-[4.6rem] font-medium leading-[0.98] mt-5 text-balance" style={{ "--i": 1 } as React.CSSProperties}>
                Your birth chart. <span className="text-gold-grad italic">Every degree,</span> explained.
              </h1>
              <p className="rise mt-6 text-ink-2 text-[1.05rem] leading-relaxed max-w-lg" style={{ "--i": 2 } as React.CSSProperties}>
                Discover your Sun, Moon and Rising, explore your personalized week ahead, and compare your chart with famous people, a partner or a friend. Keep your birth chart reading in a beautifully designed free PDF. No account required.
              </p>
              <div className="rise mt-6 flex flex-wrap items-center gap-4" style={{ "--i": 3 } as React.CSSProperties}>
                <button className="btn btn-solid md:hidden" onClick={() => {
                  document.querySelector<HTMLSelectElement>("#birth-form select")?.focus({ preventScroll: true });
                  document.getElementById("birth-form")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
                }}>Create my chart <span aria-hidden>↓</span></button>
                <Link href="/charts/albert-einstein" className="inline-flex min-h-11 items-center gap-2 border-b border-[var(--gold)] text-sm text-gold hover:text-ink">Explore an example chart <span aria-hidden>↗</span></Link>
                <span className="hidden text-xs text-muted md:inline">See what you’ll get before you begin</span>
              </div>
              <ul className="rise mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted" style={{ "--i": 3 } as React.CSSProperties}>
                {["Swiss Ephemeris", "Checked against Astro.com", "No account, no email"].map((t) => (
                  <li key={t} className="flex items-center gap-2"><span className="size-1.5 rotate-45 bg-[var(--gold)]" />{t}</li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div id="birth-form" className="rise panel glow p-6 sm:p-8" style={{ "--i": 2 } as React.CSSProperties}>
          <p className="kicker text-gold mb-5">{partnerName ? "Your birth data" : "Start with your birth details"}</p>
          <noscript><p className="mb-4 text-sm text-gold">Enable JavaScript to calculate a personal chart. You can still explore famous charts and the guides.</p></noscript>
          {children}
        </div>
      </div>
      <Horizon className="absolute inset-x-0 bottom-0 -z-0 h-[220px] w-full md:h-[300px]" />
    </section>
  );
}
