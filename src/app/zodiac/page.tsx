import type { Metadata } from "next";
import Link from "next/link";
import Crumbs from "@/components/seo/Crumbs";
import { SIGN_INFO } from "@/lib/astro/signs";
import { SIGN_GLYPHS } from "@/lib/astro/zodiac";
import { allSummaries } from "@/lib/famous-summary";

export const metadata: Metadata = {
  title: "The 12 Zodiac Signs: Dates, Traits & Famous People",
  description: "All 12 zodiac signs with their dates, element and ruling planet, what each means as a Sun, Moon and Rising sign, and famous people born under it.",
  alternates: { canonical: "/zodiac" },
};

export default async function ZodiacIndex() {
  const people = await allSummaries();
  const count = (sign: string) => people.filter((p) => p.sun.length === 1 && p.sun[0] === sign).length;
  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 sm:px-8 pb-10">
      <Crumbs items={[["Home", "/"], ["Zodiac signs", "/zodiac"]]} />
      <header className="pt-6 pb-10 max-w-2xl">
        <p className="rise kicker text-gold">Zodiac signs</p>
        <h1 className="rise font-serif text-5xl sm:text-6xl font-medium leading-[1.02] mt-4" style={{ "--i": 1 } as React.CSSProperties}>
          The 12 zodiac signs, and who was born under each.
        </h1>
        <p className="rise mt-5 leading-relaxed text-ink-2" style={{ "--i": 2 } as React.CSSProperties}>Your Sun sign comes from your birthday, but your Moon and Rising signs can be different. Choose a sign to see its dates, element and ruling planet, what it means in each position and which famous people share it.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SIGN_INFO.map((s, i) => (
          <Link key={s.slug} href={`/zodiac/${s.slug}`} className="rise panel group p-6 transition-colors hover:border-[var(--gold)]" style={{ "--i": i } as React.CSSProperties}>
            <div className="flex items-center justify-between">
              <span className="glyph text-4xl text-gold">{SIGN_GLYPHS[i]}</span>
              <span className="caps !text-[0.58rem] text-muted">{s.element} · {s.modality}</span>
            </div>
            <h2 className="mt-4 font-serif text-3xl font-medium group-hover:text-[#fff6e3]">{s.sign}</h2>
            <p className="text-sm text-muted">{s.dates}</p>
            <p className="mt-3 text-sm text-ink-2">{count(s.sign).toLocaleString("en")} famous people with a {s.sign} Sun</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
