"use client";

import { useState } from "react";
import { aspectOrbLabel, aspectTitle, placementSentence } from "@/lib/astro/library";
import { aspectRef, pointMap, signatureAspect, signsOf } from "@/lib/astro/reading";
import type { Chart } from "@/lib/astro/types";
import { POINT_NAMES } from "@/lib/astro/zodiac";
import { explainChartRef } from "@/lib/chart-explanation";

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

/** A short path through a first chart. The full, technical views stay one step away. */
export default function GuidedTour({ chart }: { chart: Chart }) {
  const [step, setStep] = useState(0);
  const points = pointMap(chart);
  const big3 = (["sun", "moon", "asc"] as const).flatMap((id) => {
    const point = points[id];
    if (!point) return [];
    const signs = signsOf(point);
    return [`${POINT_NAMES[id]} in ${signs.join(" or ")}: ${signs.length === 1 ? placementSentence(id, signs[0]) : "both signs remain possible until the birth time is known."}`];
  });
  const sig = signatureAspect(chart);
  const aspectLine = sig && explainChartRef(chart, "placidus", aspectRef(sig))?.entry.lines[0];
  const sunHouses = points.sun?.houses;
  const steps: { label: string; title: string; body: string[]; target: string; action: string }[] = [
    { label: "Big Three", title: "Start with three placements", body: [...big3, ...(chart.timeKnown ? [] : ["Rising needs a birth time, so it is left out rather than guessed."])], target: "chart-explorer", action: "Explore each placement" },
    { label: "Strongest aspect", title: sig ? `${aspectTitle(sig)}, ${aspectOrbLabel(sig, chart.timeKnown)}` : "No close aspect stands out", body: sig ? [`This is the closest personal contact on your card. A smaller orb means closer geometry, not a more certain outcome.`, ...(aspectLine ? [aspectLine] : [])] : ["Your chart has no close contact that qualifies for the card. The full list is below."], target: "why", action: "See every sentence and its source" },
    { label: "Houses", title: "Where it plays out", body: chart.timeKnown && sunHouses ? [`Houses divide the chart into areas of life. Your Sun falls in house ${sunHouses.whole} by whole sign${sunHouses.placidus ? ` and house ${sunHouses.placidus} by Placidus` : ""}.`, sunHouses.placidus && sunHouses.placidus !== sunHouses.whole ? "The two systems disagree here, which is a difference of method. Your Sun has not moved." : "Other planets may differ between systems, and the table marks each one."] : ["Houses need a birth time, so they are hidden for this chart. Everything else stays available."], target: "houses", action: "Compare house systems" },
    { label: "Your week", title: "Then come back to it", body: ["Your week ahead picks up to three themes from current transits to this chart, with the calculation behind each one. Save the chart on this device to reopen it next week."], target: "week", action: "Read my week" },
  ];
  const current = steps[step];
  return <section aria-labelledby="tour-title" className="panel mt-5 p-5 sm:p-7 no-print">
    <p className="kicker text-gold">New to birth charts? Four short steps</p>
    <ol className="mt-4 flex flex-wrap gap-2">{steps.map((s, i) => <li key={s.label}><button type="button" className={`topic-chip ${i === step ? "is-active" : ""}`} aria-current={i === step ? "step" : undefined} onClick={() => setStep(i)}>{i + 1}. {s.label}</button></li>)}</ol>
    <h2 id="tour-title" className="mt-5 font-serif text-3xl">{current.title}</h2>
    <div aria-live="polite">{current.body.map((line) => <p key={line} className="mt-2 text-sm leading-relaxed text-ink-2">{line}</p>)}</div>
    <div className="mt-5 flex flex-wrap items-center gap-3">
      {step < steps.length - 1 && <button type="button" className="btn btn-solid" onClick={() => setStep(step + 1)}>Next</button>}
      <button type="button" className="inline-flex min-h-11 items-center text-sm text-gold underline" onClick={() => go(current.target)}>{current.action}</button>
    </div>
  </section>;
}
