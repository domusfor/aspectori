"use client";

import { ASPECT_BY_TYPE } from "@/lib/astro/aspects";
import { transitSentence } from "@/lib/astro/library";
import { pointMap, positionLabel } from "@/lib/astro/reading";
import type { Chart, YearResult } from "@/lib/astro/types";
import { POINT_GLYPHS, POINT_NAMES } from "@/lib/astro/zodiac";
import { fmtDate } from "@/lib/url";

const verb = (t: keyof typeof ASPECT_BY_TYPE) => (t === "conjunction" ? "crosses" : ASPECT_BY_TYPE[t].verb3);

export default function Year({ chart, year }: { chart: Chart; year: YearResult }) {
  const pts = pointMap(chart);
  return (
    <div>
      <ol className="relative grid gap-0 border-l border-[var(--line-2)] ml-2">
        {year.transits.map((t) => {
          const started = t.start < year.from;
          return (
            <li key={`${t.planet}-${t.target}-${t.type}-${t.start}`} className="relative pl-6 pb-7 last:pb-0">
              <span className="absolute -left-[5px] top-1.5 size-[9px] rounded-full border border-gold bg-[var(--bg)]" />
              <p className="caps text-gold tabular-nums">
                {started ? "Now" : fmtDate(t.start)} — {fmtDate(t.end)}
              </p>
              <h3 className="font-serif text-xl mt-1 leading-snug">
                {POINT_NAMES[t.planet]} {verb(t.type)} your {POINT_NAMES[t.target]} from{" "}
                {fmtDate(t.start, t.start.slice(0, 4) !== t.end.slice(0, 4))} to {fmtDate(t.end)}.
              </h3>
              <p className="mt-1 text-sm text-ink-2 leading-relaxed">{transitSentence(t.planet, t.target, t.type)}</p>
              <p className="mt-2 text-xs text-muted tabular-nums">
                <span className="glyph text-gold">{POINT_GLYPHS[t.planet]}{"︎"}</span> transiting {POINT_NAMES[t.planet]}
                <span className="mx-2 text-gold">{ASPECT_BY_TYPE[t.type].symbol}</span>
                <span className="glyph text-gold">{POINT_GLYPHS[t.target]}{"︎"}</span> your {POINT_NAMES[t.target]} {positionLabel(pts[t.target])}
                <span className="block mt-0.5">
                  {t.exact.length > 1 ? `${t.exact.length} passes, exact ` : "Exact "}
                  {t.exact.map((d) => fmtDate(d)).join(", ")}
                </span>
              </p>
            </li>
          );
        })}
      </ol>
      {year.skippedTargets.length > 0 && (
        <p className="mt-6 text-xs text-muted max-w-prose">
          Without a birth time, transits to your Moon, Rising and Midheaven are left out: they could fall anywhere within
          a day&apos;s range.
        </p>
      )}
    </div>
  );
}
