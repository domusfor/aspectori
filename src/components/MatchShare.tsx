"use client";

import { useRef } from "react";
import DownloadCard from "./DownloadCard";

/** A share image that names shared placements only. It carries no date, time or place. */
export default function MatchShare({ name, slug, placements }: { name: string; slug: string; placements: string[] }) {
  const card = useRef<HTMLDivElement>(null);
  if (!placements.length) return null;
  return <>
    <DownloadCard cardRef={card} fileName={`aspectori-${slug}-match.png`} label="Save match card" />
    <div aria-hidden className="fixed -left-[9999px] top-0">
      <div ref={card} className="flex h-[500px] w-[400px] flex-col justify-between p-8 text-center" style={{ background: "radial-gradient(ellipse 80% 55% at 50% 38%, #172647 0%, #0b1222 62%, #070b14 100%)" }}>
        <p className="font-display text-sm tracking-[0.3em] text-gold">ASPECTORI</p>
        <div>
          <p className="kicker text-muted">Same sky, different lives</p>
          <p className="mt-3 font-serif text-4xl leading-tight text-ink">Me and {name}</p>
          <ul className="mt-6 grid gap-2 font-serif text-2xl italic text-gold">{placements.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
        <p className="text-xs text-muted">Shared chart placements, not a compatibility score · aspectori.com</p>
      </div>
    </div>
  </>;
}
