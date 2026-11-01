"use client";

import { forwardRef } from "react";
import { aspectOrbLabel, contactSentence } from "@/lib/astro/library";
import { ASPECT_BY_TYPE } from "@/lib/astro/aspects";
import { pointMap, positionLabel, signsOf } from "@/lib/astro/reading";
import type { Chart, CoupleResult } from "@/lib/astro/types";
import { POINT_GLYPHS, POINT_NAMES } from "@/lib/astro/zodiac";

const summary = (c: Chart) => {
  const p = pointMap(c);
  const bits = [`${signsOf(p.sun).join("/")} Sun`, `${signsOf(p.moon).join("/")} Moon`];
  if (p.asc) bits.push(`${signsOf(p.asc)[0]} Rising`);
  return bits.join(" · ");
};

/** Three contacts, each with its orb. No score. */
const CoupleCard = forwardRef<HTMLDivElement, { result: CoupleResult; themLabel?: string }>(function CoupleCard({ result, themLabel = "Them" }, ref) {
  const { a, b, contacts } = result;
  const pa = pointMap(a), pb = pointMap(b);
  const known = a.timeKnown && b.timeKnown;
  return (
    <div
      ref={ref}
      className="card-enter glow mx-auto w-full max-w-[460px] rounded-[3px] border border-[var(--line-2)] px-5 py-5"
      style={{ background: "radial-gradient(ellipse 90% 60% at 50% 0%, #172647 0%, #0b1222 60%, #070b14 100%)" }}
    >
      <div className="flex justify-between caps text-muted !text-[0.58rem]">
        <span className="font-display tracking-[0.3em] text-gold">Aspectori</span>
        <span>three highlighted contacts</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-ink-2">
        <div><p className="caps !text-[0.56rem] text-gold">You</p><p className="mt-1">{summary(a)}</p></div>
        <div className="text-right"><p className="caps !text-[0.56rem] text-gold">{themLabel}</p><p className="mt-1">{summary(b)}</p></div>
      </div>

      {contacts.length === 0 && (
        <p className="mt-6 text-sm text-ink-2">No tight contacts meet the comparison rules at all checked samples. Add birth times to see more.</p>
      )}
      <ol className="mt-5 grid gap-4">
        {contacts.map((c, i) => (
          <li key={`${c.a}-${c.b}`} className="rise border-t border-[var(--line)] pt-4" style={{ "--i": i + 3 } as React.CSSProperties}>
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-serif text-xl leading-tight">
                Your {POINT_NAMES[c.a]} {ASPECT_BY_TYPE[c.type].verb} {themLabel === "Them" ? "their" : `${themLabel.split(" ")[0]}'s`} {POINT_NAMES[c.b]}
              </h3>
              <span
                className="caps !text-[0.56rem] !tracking-[0.18em] px-2 py-1 border shrink-0"
                style={{ color: c.easy ? "var(--easy)" : "var(--tense)", borderColor: c.easy ? "var(--easy)" : "var(--tense)" }}
              >
                {c.easy ? "Easy" : "Tense"}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-2 leading-relaxed">{contactSentence(c)}</p>
            <p className="mt-2 text-xs text-muted tabular-nums">
              <span className="glyph text-gold">{POINT_GLYPHS[c.a]}{"︎"}</span> {positionLabel(pa[c.a])}
              <span className="mx-2 text-gold">{ASPECT_BY_TYPE[c.type].symbol}</span>
              <span className="glyph text-gold">{POINT_GLYPHS[c.b]}{"︎"}</span> {positionLabel(pb[c.b])}
              <span className="ml-2 text-ink">orb {aspectOrbLabel(c, known)}</span>
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
});

export default CoupleCard;
