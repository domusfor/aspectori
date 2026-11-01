import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PersonCard, { PersonRow } from "@/components/famous/PersonCard";
import { SectionHead } from "@/components/Reading";
import Crumbs from "@/components/seo/Crumbs";
import { MOON, RISING, SUN } from "@/lib/astro/library";
import { comboSlug, elementBlend, parseCombo, signBySlug, signInfo, SIGN_INFO } from "@/lib/astro/signs";
import { SIGN_GLYPHS, SIGNS, type Sign } from "@/lib/astro/zodiac";
import { allSummaries, type FamousSummary } from "@/lib/famous-summary";
import RouteLoading from "@/components/site/RouteLoading";

export function generateStaticParams() {
  return [
    ...SIGN_INFO.map((s) => ({ slug: s.slug })),
    ...SIGNS.flatMap((sun) => SIGNS.map((moon) => ({ slug: comboSlug(sun, moon) }))),
  ];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = signBySlug(slug);
  if (s) {
    return {
      title: `${s.sign} Zodiac Sign: Dates, Traits and Famous ${s.sign}s`,
      description: `${s.sign} (${s.dates}) is a ${s.modality.toLowerCase()} ${s.element.toLowerCase()} sign ruled by ${s.ruler}. What ${s.sign} means as a Sun, Moon and Rising sign, and the famous people born with the Sun in ${s.sign}.`,
      alternates: { canonical: `/zodiac/${slug}` },
    };
  }
  const combo = parseCombo(slug);
  if (!combo) return {};
  const [sun, moon] = combo;
  return {
    title: `${sun} Sun & ${moon} Moon Meaning`,
    description: `What it means to have the Sun in ${sun} and the Moon in ${moon}: the personality, how the two signs get along, and famous people born with this combination.`,
    alternates: { canonical: `/zodiac/${slug}` },
  };
}

const certain = (signs: Sign[], sign: Sign) => signs.length === 1 && signs[0] === sign;

export default function ZodiacPage({ params }: Props) {
  return <Suspense fallback={<RouteLoading label="zodiac page" />}><ZodiacContent params={params} /></Suspense>;
}

async function ZodiacContent({ params }: Props) {
  const { slug } = await params;
  const people = await allSummaries();
  const s = signBySlug(slug);
  if (s) return <SignPage sign={s.sign} people={people} />;
  const combo = parseCombo(slug);
  if (!combo) notFound();
  return <ComboPage sun={combo[0]} moon={combo[1]} people={people} />;
}

function Facts({ sign }: { sign: Sign }) {
  const s = signInfo(sign);
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[3px] border border-[var(--line)] bg-[var(--line)] sm:grid-cols-4">
      {[["Dates", s.dates], ["Element", s.element], ["Modality", s.modality], ["Ruler", s.ruler]].map(([k, v]) => (
        <div key={k} className="bg-[var(--bg)] p-4">
          <dt className="caps !text-[0.58rem] text-muted">{k}</dt>
          <dd className="mt-1 font-serif text-lg">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function SignPage({ sign, people }: { sign: Sign; people: FamousSummary[] }) {
  const s = signInfo(sign);
  const famous = people.filter((p) => certain(p.sun, sign));
  const i = SIGNS.indexOf(sign);
  const combos = SIGNS.map((moon) => ({ moon, n: famous.filter((p) => certain(p.moon, moon)).length }));
  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 sm:px-8 pb-10">
      <Crumbs items={[["Home", "/"], ["Zodiac signs", "/zodiac"], [sign, `/zodiac/${s.slug}`]]} />
      <header className="pt-6 pb-8 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="rise kicker text-gold">{s.element} · {s.modality} · ruled by {s.ruler}</p>
          <h1 className="rise font-serif text-5xl sm:text-6xl font-medium leading-[1.02] mt-4" style={{ "--i": 1 } as React.CSSProperties}>
            {sign} zodiac sign
          </h1>
          <p className="rise mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-ink-2" style={{ "--i": 2 } as React.CSSProperties}>{s.about}</p>
          <p className="rise mt-4 text-sm text-muted" style={{ "--i": 3 } as React.CSSProperties}>Keywords: {s.keywords.join(", ")}</p>
        </div>
        <span className="glyph float text-[9rem] leading-none text-gold opacity-80" aria-hidden>{SIGN_GLYPHS[i]}</span>
      </header>
      <Facts sign={sign} />

      <section className="mt-16 grid gap-4 md:grid-cols-3">
        {[["Sun in " + sign, SUN[sign], "Who you are at the core."], ["Moon in " + sign, MOON[sign], "What you need to feel safe."], [sign + " Rising", RISING[sign], "How you come across."]].map(([t, body, sub]) => (
          <div key={t} className="panel p-6">
            <p className="kicker text-gold">{sub}</p>
            <h2 className="mt-2 font-serif text-2xl font-medium">{t}</h2>
            <p className="mt-2 text-ink-2 leading-relaxed">{body}</p>
          </div>
        ))}
      </section>

      <section className="mt-20">
        <SectionHead kicker={`${famous.length.toLocaleString("en")} charts`} title={`Famous ${sign}s`}>
          People with the Sun in {sign} for certain. Charts where the Sun changed sign on the birth day are left out.
        </SectionHead>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {famous.slice(0, 9).map((p, k) => <PersonCard key={p.slug} p={p} i={k} />)}
        </div>
        <ul className="mt-8 grid gap-x-10 md:grid-cols-2">
          {famous.slice(9, 109).map((p) => <PersonRow key={p.slug} p={p} />)}
        </ul>
      </section>

      <section className="mt-20">
        <SectionHead kicker="Sun and Moon" title={`${sign} Sun with each Moon sign`} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {combos.map(({ moon, n }) => (
            <Link key={moon} href={`/zodiac/${comboSlug(sign, moon)}`} className="panel flex items-center justify-between px-4 py-3 text-sm hover:border-[var(--gold)]">
              <span>{sign} Sun, {moon} Moon</span>
              <span className="text-xs text-muted">{n}</span>
            </Link>
          ))}
        </div>
      </section>
      <Cta />
    </main>
  );
}

function ComboPage({ sun, moon, people }: { sun: Sign; moon: Sign; people: FamousSummary[] }) {
  const a = signInfo(sun), b = signInfo(moon);
  const famous = people.filter((p) => certain(p.sun, sun) && certain(p.moon, moon));
  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 sm:px-8 pb-10">
      <Crumbs items={[["Home", "/"], ["Zodiac signs", "/zodiac"], [sun, `/zodiac/${a.slug}`], [`${sun} Sun ${moon} Moon`, `/zodiac/${comboSlug(sun, moon)}`]]} />
      <header className="pt-6 pb-8 max-w-3xl">
        <p className="rise kicker text-gold">Sun and Moon combination</p>
        <h1 className="rise font-serif text-5xl sm:text-6xl font-medium leading-[1.02] mt-4" style={{ "--i": 1 } as React.CSSProperties}>
          {sun} Sun, {moon} Moon
        </h1>
        <p className="rise mt-5 text-[1.05rem] leading-relaxed text-ink-2" style={{ "--i": 2 } as React.CSSProperties}>{elementBlend(a.element, b.element)}</p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="panel p-6">
          <p className="kicker text-gold">The Sun in {sun}</p>
          <p className="mt-2 font-serif text-xl leading-snug">{SUN[sun]}</p>
          <p className="mt-3 text-sm text-muted">{a.element}, {a.modality.toLowerCase()}, ruled by {a.ruler}. <Link className="text-gold underline underline-offset-4" href={`/zodiac/${a.slug}`}>More about {sun}</Link></p>
        </div>
        <div className="panel p-6">
          <p className="kicker text-gold">The Moon in {moon}</p>
          <p className="mt-2 font-serif text-xl leading-snug">{MOON[moon]}</p>
          <p className="mt-3 text-sm text-muted">{b.element}, {b.modality.toLowerCase()}, ruled by {b.ruler}. <Link className="text-gold underline underline-offset-4" href={`/zodiac/${b.slug}`}>More about {moon}</Link></p>
        </div>
      </section>
      <p className="mt-6 max-w-2xl text-sm text-muted">
        Thousands of people share this Sun and Moon. What makes your chart yours is the exact degrees, the Rising sign and
        the tightest aspect, which only your birth time and place can give.
      </p>

      <section className="mt-16">
        <SectionHead kicker={`${famous.length.toLocaleString("en")} charts`} title={`Famous people with a ${sun} Sun and ${moon} Moon`} />
        {famous.length === 0 ? (
          <p className="text-muted">No famous chart in our collection has this combination for certain yet.</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {famous.slice(0, 6).map((p, k) => <PersonCard key={p.slug} p={p} i={k} />)}
            </div>
            <ul className="mt-8 grid gap-x-10 md:grid-cols-2">
              {famous.slice(6, 80).map((p) => <PersonRow key={p.slug} p={p} />)}
            </ul>
          </>
        )}
      </section>

      <section className="mt-16">
        <SectionHead kicker="Other combinations" title={`${sun} Sun with other Moons`} />
        <div className="flex flex-wrap gap-2">
          {SIGNS.filter((m) => m !== moon).map((m) => (
            <Link key={m} href={`/zodiac/${comboSlug(sun, m)}`} className="caps !text-[0.6rem] rounded-full border border-[var(--line)] px-3.5 py-1.5 text-muted hover:border-[var(--gold)] hover:text-ink">
              {m} Moon
            </Link>
          ))}
        </div>
      </section>
      <Cta />
    </main>
  );
}

function Cta() {
  return (
    <section className="panel glow mt-20 p-10 text-center">
      <p className="kicker text-gold">Your chart</p>
      <h2 className="mx-auto mt-3 max-w-xl font-serif text-4xl font-medium leading-tight">See your Sun, Moon and Rising to the degree.</h2>
      <Link href="/" className="btn btn-solid mt-6">Draw my chart</Link>
    </section>
  );
}
