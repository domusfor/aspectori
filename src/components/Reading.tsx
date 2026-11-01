"use client";

import type { Entry } from "@/lib/astro/reading";

export function EntryList({ entries, active }: { entries: Entry[]; active: string | null }) {
  return (
    <ol className="grid gap-px bg-[var(--line)] border border-[var(--line)]">
      {entries.map((e) => (
        <li key={e.ref} id={`row-${e.ref}`} className={`bg-[var(--bg)] px-4 py-4 scroll-mt-24 transition-colors hover:bg-[#0b1222] ${active === e.ref ? "hl" : ""}`}>
          <h3 className="font-serif text-[1.35rem] font-medium leading-tight">{e.title}</h3>
          {e.lines.map((l) => (
            <p key={l} className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-2">{l}</p>
          ))}
          <dl className="mt-3 grid gap-1">
            {e.evidence.map((ev) => (
              <div key={ev.label} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-xs text-muted tabular-nums">
                <dt className="caps !text-[0.6rem] text-gold min-w-[6.5rem]">
                  <span className="glyph text-sm normal-case tracking-normal mr-1.5">{ev.glyph}{"︎"}</span>
                  {ev.label}
                </dt>
                <dd className="text-ink">{ev.position}</dd>
                {ev.house && <dd>{ev.house}</dd>}
                {ev.note && <dd className="italic">{ev.note}</dd>}
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ol>
  );
}

export function SectionHead({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="mb-5">
      <p className="kicker text-gold">{kicker}</p>
      <h2 className="font-serif text-[2rem] sm:text-4xl font-medium mt-2 leading-tight text-balance">{title}</h2>
      {children && <div className="mt-2 text-sm text-ink-2 leading-relaxed max-w-prose">{children}</div>}
    </header>
  );
}
