"use client";

import { forwardRef, Fragment } from "react";
import { aspectOrbLabel, aspectTitle } from "@/lib/astro/library";
import { aspectRef, pointMap, signatureAspect, signsOf } from "@/lib/astro/reading";
import type { Chart, HouseSystem } from "@/lib/astro/types";
import { fmtDeg, signOf } from "@/lib/astro/zodiac";
import { fmtDate } from "@/lib/url";
import Wheel from "./Wheel";

interface Props {
  chart: Chart;
  sys: HouseSystem;
  active: string | null;
  onSelect: (ref: string) => void;
  /** Shown top left instead of the date, e.g. a famous person's name. */
  title?: string;
}

/** The shareable card. Every word on it is a link to the row that produced it. */
const Card = forwardRef<HTMLDivElement, Props>(function Card({ chart, sys, active, onSelect, title }, ref) {
  const pts = pointMap(chart);
  const sig = signatureAspect(chart);
  const link = (id: string, children: React.ReactNode) => (
    <button type="button" className="ref" data-on={active === id} onClick={() => onSelect(id)}>
      {children}
    </button>
  );

  const parts: { id: string; text: string }[] = [
    { id: "sun", text: `${signsOf(pts.sun).join(" or ")} Sun` },
    { id: "moon", text: `${signsOf(pts.moon).join(" or ")} Moon` },
  ];
  if (pts.asc) parts.push({ id: "asc", text: `${signOf(pts.asc.lon)} Rising` });

  const deg = (id: "sun" | "moon" | "asc") => {
    const p = pts[id];
    if (!p) return null;
    if (p.range) return signsOf(p).length > 1 ? "two signs" : `${fmtDeg(p.range.start)}–${fmtDeg(p.range.end)}`;
    return fmtDeg(p.lon);
  };

  return (
    <div
      ref={ref}
      className="card-enter glow relative mx-auto w-full max-w-[420px] aspect-[4/5] overflow-hidden rounded-[3px] border border-[var(--line-2)] px-6 pt-5 pb-5 flex flex-col"
      style={{ background: "radial-gradient(ellipse 80% 55% at 50% 38%, #172647 0%, #0b1222 62%, #070b14 100%)" }}
    >
      <div className="flex justify-between caps text-muted !text-[0.58rem]">
        <span className="font-display tracking-[0.3em] text-gold">{title ?? "Aspectori"}</span>
        <span>{fmtDate(chart.input.date)}</span>
      </div>

      <Wheel chart={chart} sys={sys} active={active} onSelect={onSelect} className="w-[78%] mx-auto mt-2" animate />

      <h2 className="rise font-serif text-[1.7rem] font-medium leading-[1.12] text-center mt-3 text-balance" style={{ "--i": 6 } as React.CSSProperties}>
        {parts.map((p, i) => (
          <Fragment key={p.id}>
            <span className="whitespace-nowrap">
              {link(p.id, p.text)}
              {i < parts.length - 1 ? "," : "."}
            </span>
            {i < parts.length - 1 ? " " : ""}
          </Fragment>
        ))}
      </h2>
      {sig && (
        <p className="rise font-serif italic text-gold text-lg text-center mt-1" style={{ "--i": 9 } as React.CSSProperties}>
          {link(aspectRef(sig), `${aspectTitle(sig)}, ${aspectOrbLabel(sig, chart.timeKnown)}`)}
        </p>
      )}

      <div className="mt-auto pt-3 border-t border-[var(--line)] grid grid-cols-3 text-center caps !text-[0.56rem] !tracking-[0.2em] text-ink-2 tabular-nums">
        <span>☉{"︎"} {deg("sun")}</span>
        <span>☽{"︎"} {deg("moon")}</span>
        <span>{chart.timeKnown ? `AC ${deg("asc")}` : "AC · no time"}</span>
      </div>
      <p className="caps !text-[0.52rem] text-muted text-center mt-2 truncate">
        {chart.input.place.label.split(",")[0]} · {chart.timeKnown ? chart.input.time : "time unknown"}
      </p>
    </div>
  );
});

export default Card;
