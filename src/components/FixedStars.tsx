"use client";

import { STARS } from "@/lib/astro/stars";
import type { Chart } from "@/lib/astro/types";
import { fmtOrb, fmtPos, POINT_GLYPHS, POINT_NAMES } from "@/lib/astro/zodiac";
import { SectionHead } from "./Reading";

const INFO = Object.fromEntries(STARS.map((s) => [s.name, s]));

export default function FixedStars({ chart, active }: { chart: Chart; active: string | null }) {
  return (
    <section id="stars" className="scroll-mt-16">
      <SectionHead kicker="Fixed stars" title={chart.stars.length ? "The stars your planets sit on" : "No planet on a major star"}>
        Twenty bright stars astrologers have read for centuries, from Regulus to Antares. A star counts when a planet
        {chart.timeKnown ? " or angle" : ""} is within 1° of it.
        {!chart.stars.length && " That is common: most charts have none or one."}
      </SectionHead>
      {chart.stars.length > 0 && (
        <ol className="grid gap-px border border-[var(--line)] bg-[var(--line)]">
          {chart.stars.map((s) => {
            const ref = `star-${s.star}-${s.point}`;
            return (
              <li key={ref} id={`row-${ref}`} className={`bg-[var(--bg)] px-4 py-4 ${active === ref ? "hl" : ""}`}>
                <h3 className="font-serif text-[1.35rem] font-medium leading-tight">
                  <span className="text-gold mr-2">✦</span>
                  {POINT_NAMES[s.point]} on {s.star}
                </h3>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-2">
                  {s.star} is {INFO[s.star].meaning}. With {POINT_NAMES[s.point] === "Rising" ? "your Rising sign" : `your ${POINT_NAMES[s.point]}`} on it, that theme runs through{" "}
                  {s.point === "asc" ? "how people meet you" : s.point === "mc" ? "your public life" : "this part of you"}.
                </p>
                <p className="mt-3 text-xs text-muted tabular-nums">
                  <span className="caps !text-[0.6rem] text-gold mr-3">✦ {s.star}</span>{fmtPos(s.lon)} in {INFO[s.star].in}
                  <span className="mx-2">·</span>
                  <span className="glyph text-gold">{POINT_GLYPHS[s.point]}{"︎"}</span> orb {fmtOrb(s.orb)}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
