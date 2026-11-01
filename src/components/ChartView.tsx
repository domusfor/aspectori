"use client";

import { useRef, useState } from "react";
import DownloadCard from "./DownloadCard";
import Link from "next/link";
import { reportHref, REPORT_OFFER } from "@/lib/report";
import { buildReading } from "@/lib/astro/reading";
import type { Chart, HouseSystem } from "@/lib/astro/types";
import Card from "./Card";
import FixedStars from "./FixedStars";
import Houses from "./Houses";
import { EntryList, SectionHead } from "./Reading";
import Reveal from "./Reveal";
import ChartExplorer from "./ChartExplorer";

interface Props {
  chart: Chart;
  /** Name on the card, for famous charts. */
  title?: string;
  fileName: string;
  /** Buttons and notes under the card. */
  cardFooter?: React.ReactNode;
  /** Sections after houses (couple, year…). */
  children?: React.ReactNode;
  sections?: { id: string; label: string }[];
}

/** Card on the left (sticky on desktop), the reasons and the houses on the right. */
export default function ChartView({ chart, title, fileName, cardFooter, children, sections = [] }: Props) {
  const [sysPref, setSys] = useState<HouseSystem>("placidus");
  const [active, setActive] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const sys: HouseSystem = chart.cusps?.placidus ? sysPref : "whole";
  const reading = buildReading(chart, sys);

  const select = (ref: string) => {
    setActive(ref);
    requestAnimationFrame(() => {
      const target = document.getElementById("chart-explorer-title");
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    });
  };
  const jump = [{ id: "chart-explorer", label: "Explore" }, { id: "why", label: "Reading" }, { id: "houses", label: "Houses" }, { id: "stars", label: "Stars" }, ...sections];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-8 md:gap-12 items-start">
      <div className="min-w-0 lg:sticky lg:top-6">
        <Card ref={cardRef} chart={chart} sys={sys} active={active} onSelect={select} title={title} />
        <div className="rise flex flex-wrap gap-2 justify-center mt-5 no-print" style={{ "--i": 10 } as React.CSSProperties}>
          <DownloadCard cardRef={cardRef} fileName={fileName} />
          <Link className="btn btn-ghost" href={reportHref(chart, sys)}>{REPORT_OFFER.label}</Link>
          <button className="btn btn-ghost" onClick={async () => {
            try { await navigator.clipboard.writeText(window.location.href); setCopyStatus("Link copied. Anyone with this link can see the birth details in it."); }
            catch { setCopyStatus("Copy the page address from your browser to keep this chart."); }
          }}>Copy chart link</button>
          {cardFooter}
          {copyStatus && <p role="status" className="basis-full text-center text-xs text-gold">{copyStatus}</p>}
        </div>
        <nav className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 no-print" aria-label="Sections">
          {jump.map((j) => (
            <button key={j.id} className="nav-link kicker !text-[0.6rem] text-muted" onClick={() => document.getElementById(j.id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}>
              {j.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-20 min-w-0">
        <ChartExplorer chart={chart} system={sys} active={active} onSelect={setActive} onSystem={setSys} />
        <Reveal as="section" id="why" className="scroll-mt-16">
          <SectionHead kicker="Why this card" title="Every sentence, and the placement under it">
            Read the leading placements together. Select a symbol or linked phrase on the card to explore its meaning and evidence above.
          </SectionHead>
          {!chart.timeKnown && <UnknownTimeNote chart={chart} />}
          <EntryList entries={reading.lead} active={active} />
          <details className="mt-6 group">
            <summary className="kicker text-muted cursor-pointer hover:text-ink list-none">
              <span className="group-open:hidden">+ The rest of the chart</span>
              <span className="hidden group-open:inline">− The rest of the chart</span>
            </summary>
            <div className="mt-4"><EntryList entries={reading.rest} active={active} /></div>
          </details>
        </Reveal>

        <Reveal><Houses chart={chart} sys={sys} setSys={setSys} active={active} /></Reveal>

        <Reveal><FixedStars chart={chart} active={active} /></Reveal>

        {children}
      </div>
    </section>
  );
}

function UnknownTimeNote({ chart }: { chart: Chart }) {
  const moving = chart.points.filter((p) => p.range?.ingressLocal);
  return (
    <div className="mb-5 rounded-[3px] border border-[var(--line)] px-4 py-3 text-sm text-ink-2 leading-relaxed">
      <p className="kicker text-gold !text-[0.6rem] mb-1.5">No birth time</p>
      Planet positions and aspect orbs use the start and end of the local birth day. They are endpoint samples, not continuous bounds. Rising and houses need a birth time, so they are hidden.
      {moving.length > 0
        ? ` ${moving.map((p) => (p.id === "moon" ? "The Moon" : p.id[0].toUpperCase() + p.id.slice(1))).join(" and ")} changed sign that day, so both options are shown with the time it switched.`
        : " Both endpoint samples share the displayed signs; a brief boundary crossing between samples is not ruled out."}
    </div>
  );
}
