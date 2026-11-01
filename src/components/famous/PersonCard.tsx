import Link from "next/link";
import type { FamousSummary } from "@/lib/famous-summary";
import { SIGN_GLYPHS, SIGNS, type Sign } from "@/lib/astro/zodiac";

const g = (s: Sign) => SIGN_GLYPHS[SIGNS.indexOf(s)];
const both = (signs: Sign[]) => signs.join(" or ");

export default function PersonCard({ p, i = 0, heading = "h3" }: { p: FamousSummary; i?: number; heading?: "h2" | "h3" }) {
  const Heading = heading;
  return (
    <Link
      href={`/charts/${p.slug}`}
      className="rise group panel relative block overflow-hidden p-5 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-[var(--gold)]"
      style={{ "--i": Math.min(i, 12) } as React.CSSProperties}
    >
      <svg viewBox="0 0 100 100" aria-hidden className="absolute -right-8 -top-8 size-32 opacity-40 transition-transform duration-[1.5s] group-hover:rotate-45">
        <circle cx="50" cy="50" r="46" fill="none" stroke="var(--gold)" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="var(--line-2)" strokeWidth="0.5" />
        <circle cx="50" cy="4" r="1.8" fill="var(--gold)" />
      </svg>
      <div className="flex items-center justify-between caps !text-[0.56rem] text-muted">
        <span>{p.category} · {p.year}</span>
        <span className="border border-[var(--line-2)] px-1.5 py-0.5 text-gold" title="Rodden Rating">{p.rating}</span>
      </div>
      <Heading className="mt-3 font-serif text-[1.6rem] font-medium leading-tight group-hover:text-[#fff6e3]">{p.name}</Heading>
      <p className="mt-2 text-sm text-ink-2 leading-snug">
        <span className="glyph text-gold">{g(p.sun[0])}</span> {both(p.sun)} Sun · <span className="glyph text-gold">{g(p.moon[0])}</span> {both(p.moon)} Moon
        {p.rising && <> · <span className="glyph text-gold">{g(p.rising)}</span> {p.rising} Rising</>}
      </p>
      {p.signature && <p className="mt-2 font-serif italic text-gold">{p.signature}</p>}
    </Link>
  );
}

/** Compact row for long lists (category and zodiac pages). */
export function PersonRow({ p }: { p: FamousSummary }) {
  return (
    <li>
      <Link href={`/charts/${p.slug}`} className="group flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-[var(--line)] py-3 transition-colors hover:bg-[#0b1222]">
        <span className="min-w-0">
          <span className="font-serif text-lg group-hover:text-[#fff6e3]">{p.name}</span>
          <span className="ml-2 text-xs text-muted">{p.year}</span>
        </span>
        <span className="text-xs text-ink-2 tabular-nums">
          ☉ {both(p.sun)} · ☽ {both(p.moon)}{p.rising ? ` · AC ${p.rising}` : ""}
        </span>
      </Link>
    </li>
  );
}
