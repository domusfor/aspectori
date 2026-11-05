"use client";

import Link from "next/link";
import { aspectOrbLabel, aspectTitle } from "@/lib/astro/library";
import { pointMap, signatureAspect } from "@/lib/astro/reading";
import type { Chart } from "@/lib/astro/types";
import { fmtPos, POINT_NAMES } from "@/lib/astro/zodiac";
import Wheel from "../Wheel";

/** A real calculated chart, so a visitor can see the output before entering anything. */
export default function ExampleResult({ chart }: { chart: Chart }) {
  const points = pointMap(chart);
  const sig = signatureAspect(chart);
  return <section className="panel grid items-center gap-8 p-6 sm:p-9 md:grid-cols-[minmax(0,340px)_1fr]">
    <div inert><Wheel chart={chart} sys="placidus" active={null} onSelect={() => {}} className="mx-auto w-full max-w-[340px]" /></div>
    <div>
      <p className="kicker text-gold">What you get · a real result</p>
      <h2 className="mt-3 font-serif text-4xl font-medium leading-tight">Einstein’s chart, to the arcminute</h2>
      <dl className="mt-5 divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {(["sun", "moon", "asc"] as const).map((id) => <div key={id} className="flex justify-between gap-4 py-2.5"><dt className="text-ink-2">{POINT_NAMES[id]}</dt><dd className="font-serif text-xl tabular-nums">{fmtPos(points[id]!.lon)}</dd></div>)}
        {sig && <div className="flex justify-between gap-4 py-2.5"><dt className="text-ink-2">Highlighted aspect</dt><dd className="text-right font-serif text-xl">{aspectTitle(sig)}, {aspectOrbLabel(sig, true)}</dd></div>}
      </dl>
      <p className="mt-4 text-sm leading-relaxed text-ink-2">Each result also explains these placements, compares two house systems and gives you a free PDF. Birth time rated AA, from a birth record.</p>
      <Link href="/charts/albert-einstein" className="btn btn-ghost mt-5">Open the full example</Link>
    </div>
  </section>;
}
