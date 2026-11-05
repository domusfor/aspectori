"use client";

import { useState } from "react";
import Link from "next/link";
import type { CalculatorMode } from "@/data/calculators";
import type { BirthInput, Chart, CoupleResult, HouseSystem } from "@/lib/astro/types";
import { useHash, setHash } from "@/lib/use-hash";
import { decodeBirth, encodeBirth } from "@/lib/url";
import { useRequest } from "@/lib/use-request";
import { positionLabel, signsOf } from "@/lib/astro/reading";
import { placementSentence } from "@/lib/astro/library";
import { POINT_NAMES } from "@/lib/astro/zodiac";
import { reportHref } from "@/lib/report";
import BirthForm from "./BirthForm";
import Houses from "./Houses";
import ComparisonResults from "./ComparisonResults";
import { BirthMoonView, ChartRulerResult, ProfectionResult } from "./ExtraCalculatorResults";
import type { BirthMoonResult } from "@/lib/astro/moon-phase";
import { REFLECTIONS } from "@/lib/chart-insights";
import ChartToolLinks from "./ChartToolLinks";
import BirthTimeExplorer from "./BirthTimeExplorer";
import { risingGuideSlug } from "@/lib/astro/signs";

export default function FocusedCalculator({ mode }: { mode: CalculatorMode }) {
  return mode === "birth-time" ? <BirthTimeExplorer /> : <SingleResult mode={mode} />;
}

function SingleResult({ mode }: { mode: Exclude<CalculatorMode, "birth-time"> }) {
  const hash = useHash();
  const params = new URLSearchParams(hash ?? "");
  const birth = decodeBirth(params.get("b"));
  const partner = decodeBirth(params.get("p"));
  const chart = useRequest<Chart>("/api/chart", mode === "synastry" || mode === "moon-phase" ? null : birth);
  const moon = useRequest<BirthMoonResult>("/api/birth-moon", mode === "moon-phase" ? birth : null);
  const couple = useRequest<CoupleResult>("/api/couple", mode === "synastry" && birth && partner ? { a: birth, b: partner } : null);
  const [system, setSystem] = useState<HouseSystem>("placidus");
  const request = mode === "synastry" ? couple : mode === "moon-phase" ? moon : chart;
  const save = (key: "b" | "p", input: BirthInput) => {
    const encoded = encodeBirth(input);
    if (params.get(key) === encoded) request.retry();
    params.set(key, encoded); setHash(params);
  };
  const selected = mode === "moon" ? ["moon"] : mode === "venus" ? ["venus"] : mode === "mars" ? ["mars"] : mode === "rising" ? ["asc"] : mode === "big-three" ? ["sun", "moon", "asc"] : [];
  return <div className="grid gap-8" id="calculator">
    <noscript><p className="panel p-5">Enable JavaScript to calculate a result. The guide and questions below are available without it.</p></noscript>
    <div className={`grid gap-5 ${mode === "synastry" ? "md:grid-cols-2" : "md:grid-cols-[minmax(0,460px)_1fr]"}`}>
      <div className="panel p-5 sm:p-7"><h2 className="kicker text-gold mb-5">{mode === "synastry" ? "Your birth details" : "Calculate your result"}</h2><BirthForm key={params.get("b") ?? "new"} initial={birth} submitLabel={mode === "synastry" ? "Use my details" : "Calculate"} busy={request.loading} onSubmit={(input) => save("b", input)} /></div>
      {mode === "synastry" ? <div className="panel p-5 sm:p-7"><h2 className="kicker text-gold mb-5">Their birth details</h2><BirthForm key={params.get("p") ?? "partner"} initial={partner} submitLabel="Compare charts" busy={request.loading} onSubmit={(input) => save("p", input)} /></div>
      : <div className="self-start panel p-6" aria-live="polite">
        <h2 className="font-serif text-3xl mb-4">{request.data ? "Your result" : "Your result will appear here"}</h2>
        {!request.data && !request.loading && !request.error && <p className="text-ink-2 leading-relaxed">Enter your birth date, time and birthplace. No account, payment or email is required.</p>}
        {moon.data && <BirthMoonView result={moon.data} />}
        {chart.data && mode === "chart-ruler" && <ChartRulerResult chart={chart.data} />}
        {chart.data && mode === "profections" && <ProfectionResult key={params.get("b")} chart={chart.data} />}
        {chart.data && mode !== "houses" && <div className="grid gap-6">{chart.data.points.filter((point) => selected.includes(point.id)).map((point) => <section key={point.id}><p className="kicker text-gold">{POINT_NAMES[point.id]}</p><h3 className="font-serif text-3xl mt-2">{signsOf(point).join(" or ")}</h3><p className="mt-1 text-sm text-gold">{positionLabel(point)}</p>{point.range?.ingressLocal && <p className="mt-2 text-sm">Changes sign at {point.range.ingressLocal} local time. Your birth time determines which sign applies.</p>}<p className="mt-3 text-sm leading-relaxed text-ink-2">{signsOf(point).length === 1 ? placementSentence(point.id, signsOf(point)[0]) : "Both signs remain possible; your exact birth time would resolve this."}</p>{point.id === "asc" && <p className="mt-3 flex flex-wrap gap-x-5 text-sm"><Link className="inline-flex min-h-11 items-center text-gold underline" href={`/learn/${risingGuideSlug(signsOf(point)[0])}`}>Read the {signsOf(point)[0]} Rising guide</Link><Link className="inline-flex min-h-11 items-center text-gold underline" href={`/calculators/birth-time-explorer#${new URLSearchParams({ b: encodeBirth(chart.data!.input) })}`}>Unsure of the time? Explore a range</Link></p>}</section>)}</div>}
        {chart.data && !chart.data.timeKnown && <p className="mt-5 text-sm text-gold">Birth time unknown, so your Rising sign and houses are not available. Planet signs are checked at the start and end of your birth day. If they match, a planet could still have crossed into another sign and back in between, though this is rare.</p>}
        {chart.data && (mode === "venus" || mode === "mars") && <div className="tool-result-card mt-5 p-5">{chart.data.timeKnown && (() => { const point = chart.data.points.find((p) => p.id === mode)!; return <p className="text-sm text-gold mb-4">{point.retro ? "Retrograde" : "Direct motion"} at birth · Whole sign house {point.houses?.whole}{point.houses?.placidus ? ` · Placidus house ${point.houses.placidus}` : " · Placidus unavailable"}</p>; })()}<p className="kicker text-muted">A question for reflection</p><p className="text-sm leading-relaxed mt-3">{REFLECTIONS[mode]}</p></div>}
        {chart.data && <div className="mt-6 flex flex-wrap gap-3"><Link className="btn btn-solid" href={`/#${new URLSearchParams({ b: encodeBirth(chart.data.input) })}`}>Explore chart & matches</Link><Link className="btn btn-ghost" href={reportHref(chart.data, system)}>Free PDF report</Link></div>}
        {moon.data && birth && <div className="mt-6 flex flex-wrap gap-3"><Link className="btn btn-solid" href={`/#${new URLSearchParams({ b: encodeBirth(birth) })}`}>Explore chart & matches</Link><Link className="btn btn-ghost" href={`/report#${new URLSearchParams({ b: encodeBirth(birth) })}`}>Free birth chart PDF</Link></div>}
      </div>}
    </div>
    {mode === "synastry" && (!birth || !partner) && <p className="text-sm text-muted" role="status">Save each person’s details to calculate the comparison.</p>}
    {request.loading && <p role="status" className="text-gold">Calculating the sky…</p>}
    {request.error && <p role="alert" className="text-tense">{request.error} <button className="text-gold underline" onClick={request.retry}>Try again</button></p>}
    {chart.data && mode === "houses" && <Houses chart={chart.data} sys={system} setSys={setSystem} active={null} />}
    {couple.data && <ComparisonResults result={couple.data} name="Your person" />}
    {birth && request.data && <ChartToolLinks birth={birth} current={mode} />}
  </div>;
}
