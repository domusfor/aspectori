"use client";

import { DateTime } from "luxon";
import { fmtPos, POINT_GLYPHS, POINT_NAMES, signOf } from "@/lib/astro/zodiac";
import { useSky } from "@/lib/use-sky";
import { SectionHead } from "../Reading";
import Reveal from "../Reveal";
import Wheel from "../Wheel";
import MoonPhase from "./MoonPhase";

/** Where the planets are now. A reason to come back that is not a horoscope. */
export default function SkyNow() {
  const { sky, error, loading, retry } = useSky();
  return (
    <Reveal as="section" id="sky" className="scroll-mt-16">
      <SectionHead kicker="Current positions" title="A snapshot of the sky">
        Planetary positions at the calculation time shown below, from the same ephemeris as your chart. Responses may be cached; refresh to request the latest available snapshot.
      </SectionHead>
      {error && <div className="panel p-5 mb-4"><p role="alert" className="text-ink-2">{error}{sky && " The previous snapshot is still shown below."}</p><button className="btn btn-ghost mt-4" onClick={retry}>Retry sky snapshot</button></div>}
      {!sky && loading && <div className="panel grid min-h-[420px] place-items-center" role="status"><span className="sr-only">Loading sky snapshot…</span><div className="spinner" aria-hidden /></div>}
      {sky && (
        <div className="panel grid gap-8 p-5 sm:p-8 md:grid-cols-[minmax(0,400px)_1fr] md:items-center">
          <Wheel chart={sky.chart} sys="whole" className="mx-auto w-full max-w-[400px]" animate />
          <div>
            <div className="flex items-center gap-4">
              <MoonPhase illumination={sky.moon.illumination} waxing={sky.moon.waxing} size={56} />
              <div>
                <p className="font-serif text-2xl font-medium">{sky.moon.phase} in {signOf(sky.chart.points[1].lon)}</p>
                <p className="text-sm text-muted">
                  {sky.moon.illumination}% lit · enters {nextSign(sky.chart.points[1].lon)}{" "}
                  {DateTime.fromISO(sky.moon.ingress).toLocal().toFormat("ccc d LLL, HH:mm")} your time
                </p>
              </div>
            </div>
            <ul className="mt-6 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {sky.chart.points.map((p) => (
                <li key={p.id} className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] py-2 text-sm tabular-nums">
                  <span><span className="glyph mr-2 text-gold">{POINT_GLYPHS[p.id]}{"︎"}</span>{POINT_NAMES[p.id]}</span>
                  <span className="text-ink-2">
                    {fmtPos(p.lon)}
                    {p.retro && <span className="ml-1.5 text-tense" title="Retrograde">℞</span>}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted">
              Calculated {DateTime.fromISO(sky.at).toLocal().toFormat("d LLL yyyy, HH:mm")} your time. ℞ marks a planet moving backwards
              from Earth&apos;s point of view.
            </p>
            <button className="btn btn-ghost mt-4" disabled={loading} onClick={retry}>{loading ? "Refreshing…" : "Refresh sky snapshot"}</button>
          </div>
        </div>
      )}
    </Reveal>
  );
}

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const nextSign = (lon: number) => SIGNS[(Math.floor(lon / 30) + 1) % 12];
