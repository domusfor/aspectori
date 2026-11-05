import Link from "next/link";
import type { CoupleResult } from "@/lib/astro/types";
import { comparisonOverlays, OVERLAY_METHOD, overlayHouses } from "@/lib/astro/house-overlays";
import { fmtPos, POINT_NAMES } from "@/lib/astro/zodiac";

export default function HouseOverlays({ result, name }: { result: CoupleResult; name: string }) {
  const directions = comparisonOverlays(result, name);
  return <section className="mt-10" aria-labelledby="house-overlays-heading">
    <p className="kicker text-gold">Two directions, two perspectives</p>
    <h4 id="house-overlays-heading" className="font-serif text-3xl sm:text-4xl mt-3">Where your worlds meet</h4>
    <p className="text-sm text-ink-2 leading-relaxed mt-3 max-w-3xl">House overlays place each person’s planets in the other person’s chart. Read both directions: your planets in someone’s houses can differ from theirs in yours. Compare the two house systems below.</p>
    <div className="grid gap-5 mt-6 lg:grid-cols-2">
      {directions.map((direction) => <article key={direction.title} className="panel p-4 sm:p-6 min-w-0">
        <h5 className="font-serif text-2xl break-words">{direction.title}</h5>
        {direction.notes.map((note) => <p key={note} className="text-xs leading-relaxed text-ink-2 mt-3">{note}</p>)}
        {direction.available && <>
          <table className="w-full text-xs tabular-nums mt-5 border-collapse">
            <caption className="text-left text-gold pb-3">{direction.endpoints ? "House at day start → day end" : "House at the birth time you entered"}</caption>
            <thead><tr className="text-left text-muted border-b border-[var(--line)]"><th scope="col" className="py-3 font-normal">Planet</th><th scope="col" className="py-3 px-1 text-center font-normal">Whole sign</th><th scope="col" className="py-3 text-center font-normal">Placidus</th></tr></thead>
            <tbody>{direction.rows.map((row) => <tr key={row.planet} className="border-b border-[var(--line)]"><th scope="row" className="py-3 text-left font-normal text-ink">{POINT_NAMES[row.planet]}</th><td className="py-3 px-1 text-center text-gold">{overlayHouses(row.whole)}</td><td className="py-3 text-center text-ink-2">{overlayHouses(row.placidus)}</td></tr>)}</tbody>
          </table>
          <details className="mt-4"><summary className="cursor-pointer text-xs text-gold py-2">View planetary degrees and house boundaries</summary>
            <p className="text-xs text-muted mt-2">{direction.endpoints ? "Planet degrees at the start and end of the birth day:" : "Planet degrees at the birth time you entered:"}</p>
            <ul className="text-xs text-ink-2 leading-relaxed mt-3 space-y-2">{direction.rows.map((row) => <li key={row.planet}>{POINT_NAMES[row.planet]}: {row.positions.map(fmtPos).join(" → ")}</li>)}</ul>
            <p className="text-xs text-muted mt-4">Receiving chart’s house boundaries:</p>
            <ol className="text-xs text-ink-2 leading-relaxed mt-3 space-y-2">{direction.cusps?.whole.map((cusp, i) => <li key={i}>House {i + 1}: Whole sign {fmtPos(cusp)} · Placidus {direction.cusps?.placidus ? fmtPos(direction.cusps.placidus[i]) : "unavailable"}</li>)}</ol>
          </details>
        </>}
      </article>)}
    </div>
    <details className="panel p-5 mt-5 text-sm"><summary className="cursor-pointer text-gold">How to read these house overlays</summary><p className="mt-3 text-ink-2 leading-relaxed">{OVERLAY_METHOD}</p><p className="mt-3 text-ink-2 leading-relaxed">The house owner needs a known birth time. If only the planet owner’s time is missing, we show two endpoint samples. The Moon can move substantially during a day; even a slow planet can cross a nearby boundary. The ten planets are included; angles, Chiron and the node are excluded.</p><p className="mt-3"><Link className="text-gold underline" href="/method#house-overlays">Calculation method</Link> · <Link className="text-gold underline" href="/learn/whole-sign-vs-placidus">Understand the house systems</Link></p></details>
  </section>;
}
