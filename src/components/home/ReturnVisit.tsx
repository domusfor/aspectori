"use client";

import Link from "next/link";
import { useSavedChart } from "@/lib/saved-chart";
import { setHash } from "@/lib/use-hash";

/** Only appears for someone who chose to save a chart in this browser. */
export default function ReturnVisit() {
  const saved = useSavedChart();
  if (!saved) return null;
  return <div className="rise mt-6 flex flex-wrap items-center gap-3 rounded-[3px] border border-[var(--gold)] px-4 py-3" style={{ "--i": 3 } as React.CSSProperties}>
    <span className="text-sm text-ink">Welcome back.</span>
    <button type="button" className="min-h-11 text-sm text-gold underline" onClick={() => setHash(new URLSearchParams({ b: saved }))}>Open my saved chart</button>
    <Link href="/weekly-horoscope" className="inline-flex min-h-11 items-center text-sm text-gold underline">Read my week</Link>
  </div>;
}
