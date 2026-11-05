"use client";

import { useState } from "react";
import type { Chart } from "@/lib/astro/types";
import type { BirthMoonResult } from "@/lib/astro/moon-phase";
import { chartRulers, annualProfection, completedAge } from "@/lib/astro/rulership";
import { POINT_NAMES, POINT_GLYPHS, fmtPos, ordinal } from "@/lib/astro/zodiac";
import { REFLECTIONS } from "@/lib/chart-insights";
import { fmtDate } from "@/lib/url";
import MoonPhase from "./home/MoonPhase";

export function ChartRulerResult({ chart }: { chart: Chart }) {
  const result = chartRulers(chart);
  if (!result) return <p className="text-ink-2 leading-relaxed">Your chart ruler needs a Rising sign. Add a recorded birth time to calculate it; your Sun sign cannot replace this missing information.</p>;
  const points = result.traditional.id === result.modern.id ? [result.traditional] : [result.traditional, result.modern];
  return <div className="grid gap-5"><p className="text-sm text-ink-2">Your {result.sign} Rising · {fmtPos(result.asc.lon)}</p>{points.map((point, i) => <section key={point.id} className="tool-result-card p-5"><p className="kicker text-gold">{points.length === 1 ? "Traditional & modern ruler" : i === 0 ? "Traditional ruler" : "Modern alternative"}</p><h3 className="font-serif text-4xl mt-4"><span aria-hidden className="mr-3">{POINT_GLYPHS[point.id]}</span>{POINT_NAMES[point.id]}</h3><p className="text-gold mt-3">{fmtPos(point.lon)}</p><p className="text-sm text-ink-2 mt-2">Whole sign house {point.houses?.whole}{point.houses?.placidus ? ` · Placidus house ${point.houses.placidus}` : " · Placidus unavailable"}</p><p className="text-sm leading-relaxed mt-4">{REFLECTIONS[point.id]}</p></section>)}<p className="text-xs text-muted leading-relaxed">Rulership follows the Rising sign under the named convention. It is different from a dominant-planet ranking.</p></div>;
}

export function ProfectionResult({ chart }: { chart: Chart }) {
  const [ageText, setAgeText] = useState(() => String(Math.min(completedAge(chart.input.date) ?? 0, 120)));
  const age = ageText.trim() === "" ? NaN : Number(ageText);
  const valid = Number.isInteger(age) && age >= 0 && age <= 120;
  const result = valid ? annualProfection(chart, age) : null;
  return <div>
    <label className="grid gap-2 text-sm max-w-64">Age at last birthday<input className="field" type="number" min="0" max="120" step="1" value={ageText} onChange={(event) => setAgeText(event.target.value)} aria-invalid={!valid} aria-describedby="profection-age-help" /></label>
    <p id="profection-age-help" className="text-xs text-muted mt-2">Choose any whole-number age from 0 to 120.</p>
    {!valid && <p role="alert" className="text-tense text-sm mt-3">Enter a whole-number age from 0 to 120.</p>}
    {result && <>
      <section className="tool-result-card p-5 mt-5"><p className="kicker text-gold">Age {result.age} · whole-sign annual profection</p><h3 className="font-serif text-4xl mt-4">{ordinal(result.house)} house year</h3><p className="text-xl text-gold mt-3">{result.topic}</p><p className="text-sm text-ink-2 mt-3">{fmtDate(result.from)} until {fmtDate(result.until)}<br />Changes on the next birthday.</p>
      {result.rulerPoint ? <div className="border-t border-line pt-4 mt-5"><p className="kicker text-muted">{result.sign} · traditional time lord</p><p className="font-serif text-3xl mt-2">{POINT_NAMES[result.rulerPoint.id]}</p><p className="text-sm text-ink-2 mt-2">Natal {fmtPos(result.rulerPoint.lon)} · whole sign house {result.rulerPoint.houses?.whole}</p></div> : <p className="text-sm text-gold mt-4">The house number follows your age alone. The sign and time lord need a birth time, so they are left unknown.</p>}
      <p className="mt-5 text-sm leading-relaxed">{result.prompt}</p></section>
      <details className="mt-5"><summary className="text-gold cursor-pointer min-h-11 flex items-center text-sm">Explore your 12-year cycle +</summary><div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">{Array.from({ length: Math.min(12, 121 - Math.floor(age / 12) * 12) }, (_, i) => { const next = annualProfection(chart, Math.floor(age / 12) * 12 + i); return <button key={next.age} aria-pressed={age === next.age} className={`profection-cell ${age === next.age ? "is-active" : ""}`} onClick={() => setAgeText(String(next.age))}><span>Age {next.age}</span><strong>House {next.house}</strong></button>; })}</div></details>
      <p className="text-xs text-muted mt-4 leading-relaxed">Calculation: ({age} modulo 12) + 1 = house {result.house}. Sign counting starts at the Rising sign and uses traditional rulers. February 29 birthdays use February 28 in non-leap years here. This is a symbolic timing convention, not a forecast.</p>
    </>}
  </div>;
}

export function BirthMoonView({ result }: { result: BirthMoonResult }) {
  const first = result.samples[0];
  const last = result.samples.at(-1)!;
  return <div>
    <div className="tool-result-card p-6 text-center"><div className="flex justify-center gap-7">{(result.timeKnown ? [first] : [first, last]).map((sample, index) => <figure key={sample.at}><MoonPhase illumination={sample.illumination} waxing={sample.waxing} size={100} /><figcaption className="text-xs text-muted mt-3">{result.timeKnown ? "At your birth time" : index === 0 ? "Start of birth day" : "End of birth day"}</figcaption></figure>)}</div><h3 className="font-serif text-3xl mt-6">{result.phases.join(" → ")}</h3><p className="text-gold mt-3 text-lg">{result.timeKnown ? `${first.illumination.toFixed(1)}% illuminated` : `${result.minIllumination.toFixed(1)}–${result.maxIllumination.toFixed(1)}% illuminated · sampled range`}</p><p className="text-sm text-ink-2 mt-3">{result.localLabel}{!result.timeKnown && " · time unknown"}</p></div>
    {!result.timeKnown && <p className="mt-4 text-sm text-gold leading-relaxed">Without a birth time, we check the Moon every hour across your birth day. The pictures show the start and end of that day, not a guessed birth moment. The range comes from those hourly checks, so it is not an exact minimum or maximum.</p>}
    <p className="text-sm text-ink-2 mt-5 leading-relaxed">This shows sunlight on the Moon as seen from Earth. Your Moon sign describes its zodiac position; your Moon phase describes its relationship to the Sun. One does not determine the other.</p>
    <details className="mt-5 text-sm"><summary className="text-gold cursor-pointer min-h-11 flex items-center">Show the calculation +</summary><dl className="week-evidence text-xs leading-relaxed"><dt>Moon minus Sun · ecliptic longitude</dt><dd>{first.elongation.toFixed(2)}°{!result.timeKnown && ` → ${last.elongation.toFixed(2)}° (wraps at 360°)`}</dd><dt>UTC {result.timeKnown ? "moment" : "sample interval"}</dt><dd className="break-words">{first.at}{!result.timeKnown && ` → ${last.at}`}</dd><dt>Illumination</dt><dd>Swiss Ephemeris lunar phenomena · geocentric illuminated disc fraction</dd></dl><p className="mt-4 text-xs text-muted leading-relaxed">“Near” primary phases use a ±10° longitude window around new Moon (0°), first quarter (90°), full Moon (180°) and last quarter (270°). Exact phases occur at specific instants. The illustration is schematic, with waxing light on the right; local viewing orientation differs.</p></details>
    {result.notes.map((note) => <p key={note} className="text-xs text-gold mt-3">{note}</p>)}
  </div>;
}
