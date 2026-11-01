"use client";

import { positionLabel } from "@/lib/astro/reading";
import type { Chart, HouseSystem } from "@/lib/astro/types";
import { POINT_GLYPHS, POINT_NAMES } from "@/lib/astro/zodiac";
import { SectionHead } from "./Reading";

interface Props {
  chart: Chart;
  sys: HouseSystem;
  setSys: (s: HouseSystem) => void;
  active: string | null;
}

export default function Houses({ chart, sys, setSys, active }: Props) {
  if (!chart.timeKnown) {
    return (
      <section id="houses" className="scroll-mt-16">
        <SectionHead kicker="Houses" title="Houses need a birth time">
          The Rising sign moves through the whole zodiac in a day, and the houses move with it. Without a time any house
          you were shown would be a guess, so we leave them out. Your Sun and the rows above are the same either way.
        </SectionHead>
      </section>
    );
  }

  const rows = chart.points.filter((p) => p.id !== "asc" && p.id !== "mc");
  const placidusOk = chart.cusps?.placidus !== null;
  const differ = rows.filter((p) => p.houses!.placidus !== null && p.houses!.placidus !== p.houses!.whole).length;
  const porphyryOff = rows.filter((p) => p.houses!.porphyry !== (p.houses!.placidus ?? p.houses!.whole));

  return (
    <section id="houses" className="scroll-mt-16">
      <SectionHead kicker="Settle the argument" title="Two house systems, same planets">
        {placidusOk ? (
          <>
            Placidus and whole sign disagree on <strong className="text-ink font-normal">{differ} of your {rows.length}</strong> placements.
            Neither is wrong: they divide the sky differently. That is why two apps can give you two different houses for the
            same birth time.
          </>
        ) : (
          <>Placidus cannot be drawn this close to the pole, so only whole sign is shown.</>
        )}
      </SectionHead>

      {placidusOk && (
        <div role="radiogroup" aria-label="House system" className="inline-flex border border-[var(--line-2)] mb-4">
          {(["placidus", "whole"] as const).map((s) => (
            <button
              key={s}
              role="radio"
              aria-checked={sys === s}
              tabIndex={sys === s ? 0 : -1}
              onClick={() => setSys(s)}
              onKeyDown={(event) => {
                if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
                  event.preventDefault();
                  const next = event.key === "Home" ? "placidus" : event.key === "End" ? "whole" : s === "placidus" ? "whole" : "placidus";
                  setSys(next);
                  const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button");
                  buttons?.[next === "placidus" ? 0 : 1].focus();
                }
              }}
              className={`caps px-4 py-2.5 transition-colors ${sys === s ? "bg-[var(--gold-soft)] text-ink" : "text-muted"}`}
            >
              {s === "placidus" ? "Placidus" : "Whole sign"}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted mb-3">Scroll the table sideways to compare all systems on a small screen.</p>
      <div className="table-scroll overflow-x-auto" role="region" aria-label="Planetary house comparison" tabIndex={0}>
        <table className="w-full text-sm tabular-nums border-collapse">
          <thead>
            <tr className="caps !text-[0.58rem] text-muted text-left">
              <th className="py-2 pr-2 font-normal">Planet</th>
              <th className="py-2 pr-2 font-normal">Position</th>
              {placidusOk && <th className={`py-2 px-2 font-normal text-center ${sys === "placidus" ? "text-gold" : ""}`}>Placidus</th>}
              <th className={`py-2 px-2 font-normal text-center ${sys === "whole" ? "text-gold" : ""}`}>Whole</th>
              <th className="py-2 pl-2 font-normal text-center">Porphyry*</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const h = p.houses!;
              const split = h.placidus !== null && h.placidus !== h.whole;
              return (
                <tr key={p.id} className={`border-t border-[var(--line)] ${active === p.id ? "hl" : ""}`}>
                  <td className="py-2.5 pr-2 whitespace-nowrap">
                    <span className="glyph mr-2 text-gold">{POINT_GLYPHS[p.id]}{"︎"}</span>
                    {POINT_NAMES[p.id]}
                  </td>
                  <td className="py-2.5 pr-2 whitespace-nowrap text-ink-2">{positionLabel(p)}</td>
                  {placidusOk && <HouseCell n={h.placidus!} on={sys === "placidus"} split={split} />}
                  <HouseCell n={h.whole} on={sys === "whole"} split={split} />
                  <td className="py-2.5 pl-2 text-center text-muted">{h.porphyry}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted leading-relaxed max-w-prose">
        * Porphyry is the system Co–Star uses. It is neither of the two above, which is why a Co–Star house can disagree with
        CafeAstrology and Astro.com for the same birth time.{" "}
        {porphyryOff.length > 0
          ? `For you it changes ${porphyryOff.map((p) => POINT_NAMES[p.id]).join(", ")} compared with ${placidusOk ? "Placidus" : "whole sign"}.`
          : `For you it happens to agree with ${placidusOk ? "Placidus" : "whole sign"} on every planet.`}
      </p>
    </section>
  );
}

function HouseCell({ n, on, split }: { n: number; on: boolean; split: boolean }) {
  return (
    <td className={`py-2.5 px-2 text-center ${on ? "text-ink" : "text-muted"}`}>
      <span className={split ? "inline-block min-w-7 border-b border-[var(--tense)]" : "inline-block min-w-7"}>{n}</span>
    </td>
  );
}
