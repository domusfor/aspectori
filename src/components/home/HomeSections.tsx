import Link from "next/link";
import type { FamousSummary } from "@/lib/famous-summary";
import PersonCard from "../famous/PersonCard";
import { SectionHead } from "../Reading";
import Reveal from "../Reveal";
import SkyNow from "./SkyNow";
import ToTop from "./ToTop";
import { CALCULATORS } from "@/data/calculators";
import { CORE_GUIDES } from "@/data/guides";
import { REFERENCE } from "@/lib/astro/reference";
import type { Chart } from "@/lib/astro/types";
import ExampleResult from "./ExampleResult";

const FEATURES = [
  {
    k: "01", title: "A card that is actually yours",
    body: "Sun, Moon, Rising and the tightest aspect in your chart, with its orb. Two people born the same day get different cards.",
    art: <CardArt />,
  },
  {
    k: "02", title: "Every sentence shows its source",
    body: "Tap any phrase to see the placement behind it: planet, sign, degree and house. Every sentence comes from a fixed, written library, not an AI.",
    art: <RowsArt />,
  },
  {
    k: "03", title: "Two house systems, one table",
    body: "See Placidus and whole sign side by side, with every difference marked, so you know why two apps can give you different houses.",
    art: <HousesArt />,
  },
  {
    k: "04", title: "A new reading every week",
    body: "Each week brings up to three themes from dated transits, each with a question to reflect on. For the longer view, explore key transits over the next twelve months.",
    art: <YearArt />,
  },
];

const GUIDE = [
  ["Sun, Moon & Rising", "Start with the three anchors of your chart: your Sun and Moon signs, plus your Rising when your birth time is known."],
  ["Degrees & aspects", "See each planet’s exact position and the angles between them. A smaller orb means a closer connection."],
  ["Two house systems", "Compare Placidus and whole sign in one table, with differences marked so you can explore both perspectives."],
  ["Your year ahead", "Explore dated planetary transits to your chart. These are astronomical alignments with astrological interpretations, not predictions."],
];

const FAQ: [string, string][] = [
  ["Can I download my birth chart as a free PDF?", "Yes. Create your chart and choose Free PDF report. Your download includes a chart wheel, placements, a reading, major aspects and selected dated transits. No account, email or payment is required."],
  ["Do I need my exact birth time?", "No. Without a time you still get your Sun, Moon and planets, plus the aspects present at both the start and end of your birth day. We leave out the Rising sign and houses instead of guessing them. If the Moon changed sign that day, we show both signs and the time it switched."],
  ["Why do different calculators show different houses?", "Different house systems divide a chart differently. We show Placidus and whole sign side by side, with a Porphyry comparison too. Check the birth time, time zone and selected house system when comparing results."],
  ["How accurate is Aspectori?", `Positions come from the Swiss Ephemeris, the engine Astro.com uses. Every release is tested against ${REFERENCE.length} charts from Astro-Databank and must match Astro.com's Sun, Moon and Ascendant to the arcminute.`],
  ["What happens to my birth data?", "Your birth details are sent to our server to calculate the chart, then kept in your page address. We do not store them in a database. If you choose Save on this device, they stay in your browser until you remove them. Anyone you share the chart link with can read those details."],
  ["Do I get a free personalized weekly horoscope?", "Yes. Your week ahead appears automatically with your birth chart. It picks up to three themes from real transits to your chart over the next seven days, and shows the calculation behind each one. Interpretations are for entertainment, not predictions. Without a birth time, fewer themes are available. No account or payment is required."],
];

export default function HomeSections({ all, example }: { all: FamousSummary[]; example: Chart }) {
  const featured = ["albert-einstein", "marie-curie", "marilyn-monroe", "david-bowie", "michael-jordan", "madonna"];
  const people = featured.flatMap((slug) => all.filter((person) => person.slug === slug));
  const total = all.length;
  return (
    <div className="mx-auto grid w-full max-w-[1120px] gap-20 px-4 pt-8 sm:gap-24 sm:pt-12 sm:px-8">
      <ExampleResult chart={example} />

      <section className="week-panel grid gap-6 p-6 sm:p-9 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="kicker text-gold">Free every week · no sign-up</p>
          <h2 className="mt-3 font-serif text-4xl font-medium leading-tight">Your chart keeps moving. Come back to it.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">Get a personal week ahead from real transits to your chart. Save the chart in your browser and add a calendar reminder, with no email needed.</p>
        </div>
        <Link href="/weekly-horoscope" className="btn btn-solid justify-self-start">Read my week</Link>
      </section>

      <section>
        <Reveal>
          <SectionHead kicker="Why people use it" title="More than a list of signs" />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Reveal key={f.k} className="panel group overflow-hidden p-6 transition-colors duration-500 hover:border-[var(--line-2)]">
              <div className="mb-6 h-36 overflow-hidden rounded-[3px] border border-[var(--line)] bg-[#080d19]">{f.art}</div>
              <p className="kicker text-gold">{f.k}</p>
              <h3 className="mt-2 font-serif text-2xl font-medium">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <SkyNow />

      <section>
        <SectionHead kicker="Free astrology calculators" title="Start with the question you came for" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CALCULATORS.map((tool) => <Link key={tool.slug} href={`/calculators/${tool.slug}`} className="panel p-6 transition-colors hover:border-gold"><h3 className="font-serif text-2xl text-gold">{tool.title}</h3><p className="mt-3 text-sm leading-relaxed text-ink-2">{tool.description}</p></Link>)}
          <Link href="/birth-chart-report" className="panel p-6 transition-colors hover:border-gold"><h3 className="font-serif text-2xl text-gold">Free birth chart PDF</h3><p className="mt-3 text-sm leading-relaxed text-ink-2">Keep your wheel, placements, reading and dated transits together in a downloadable report. No email or payment required.</p></Link>
        </div>
      </section>

      <Reveal as="section">
        <SectionHead kicker="New to birth charts?" title="Your sky, one layer at a time">
          Start with the familiar signs, then explore the detail. You do not need to know astrology to begin.
        </SectionHead>
        <div className="grid gap-x-10 sm:grid-cols-2">
          {GUIDE.map(([title, body], index) => (
            <div key={title} className="flex gap-4 border-t border-[var(--line)] py-6">
              <span className="font-serif text-3xl text-gold" aria-hidden>0{index + 1}</span>
              <div><h3 className="font-serif text-2xl">{title}</h3><p className="mt-2 text-sm leading-relaxed text-ink-2">{body}</p></div>
            </div>
          ))}
        </div>
        <Link href="/method" className="inline-flex min-h-11 items-center text-sm text-gold underline underline-offset-4">Read how your chart is calculated →</Link>
        <Link href="/learn" className="ml-6 inline-flex min-h-11 items-center text-sm text-gold underline underline-offset-4">All guides, including the 12 Rising signs →</Link>
        <div className="grid gap-4 mt-6 sm:grid-cols-2">{CORE_GUIDES.map((guide) => <Link key={guide.slug} href={`/learn/${guide.slug}`} className="panel p-5"><h3 className="font-serif text-xl text-gold">{guide.title}</h3><p className="mt-2 text-sm leading-relaxed text-ink-2">{guide.summary}</p></Link>)}</div>
      </Reveal>

      <section>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead kicker={`${total.toLocaleString("en")} famous charts`} title="Familiar names. Individual skies." />
            <Link href="/charts" className="btn btn-ghost mb-5">Search all of them</Link>
          </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p, i) => <PersonCard key={p.slug} p={p} i={i} />)}
        </div>
      </section>

      <Reveal as="section">
        <SectionHead kicker="Questions" title="Birth chart questions, answered" />
        <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-xl font-medium">
                {q}
                <span className="text-gold transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-prose text-ink-2 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="panel glow relative overflow-hidden p-10 text-center sm:p-16">
        <p className="kicker text-gold">Free · No account</p>
        <h2 className="mx-auto mt-3 max-w-2xl font-serif text-4xl font-medium leading-tight sm:text-5xl">
          See the degree that makes your chart yours.
        </h2>
        <ToTop className="btn btn-solid mt-8">Draw my chart</ToTop>
      </Reveal>
    </div>
  );
}

/* Small illustrations for the feature tiles: drawn, not screenshots, so they stay crisp. */

function CardArt() {
  return (
    <svg viewBox="0 0 320 144" className="size-full">
      <circle cx="80" cy="72" r="52" fill="none" stroke="var(--gold)" strokeOpacity=".5" strokeWidth=".8" />
      <circle cx="80" cy="72" r="36" fill="none" stroke="var(--line-2)" strokeWidth=".6" />
      <line x1="48" y1="80" x2="110" y2="52" stroke="var(--gold)" strokeWidth="1.4" />
      <text x="150" y="62" fill="var(--ink)" fontFamily="var(--font-serif)" fontSize="19">Leo Sun, Gemini Moon,</text>
      <text x="150" y="84" fill="var(--ink)" fontFamily="var(--font-serif)" fontSize="19">Scorpio Rising.</text>
      <text x="150" y="108" fill="var(--gold)" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="15">Sun square Mars, 0°38′</text>
    </svg>
  );
}

function RowsArt() {
  return (
    <svg viewBox="0 0 320 144" className="size-full">
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(20 ${18 + i * 40})`}>
          <rect width="280" height="32" fill={i === 1 ? "rgba(216,178,94,.15)" : "transparent"} />
          {i === 1 && <rect width="2" height="32" fill="var(--gold)" />}
          <rect x="12" y="9" width={90 + i * 30} height="5" rx="2" fill="var(--ink)" opacity=".7" />
          <rect x="12" y="20" width="60" height="4" rx="2" fill="var(--gold)" opacity=".8" />
          <rect x="80" y="20" width="80" height="4" rx="2" fill="var(--muted)" opacity=".7" />
        </g>
      ))}
    </svg>
  );
}

function HousesArt() {
  const rows = [[9, 10], [7, 8], [10, 10], [6, 7]];
  return (
    <svg viewBox="0 0 320 144" className="size-full" fontFamily="var(--font-sans)">
      <text x="150" y="26" fill="var(--gold)" fontSize="9" letterSpacing="2">PLACIDUS</text>
      <text x="240" y="26" fill="var(--muted)" fontSize="9" letterSpacing="2">WHOLE</text>
      {rows.map(([a, b], i) => (
        <g key={i} transform={`translate(0 ${48 + i * 24})`}>
          <rect x="30" y="-8" width="70" height="5" rx="2" fill="var(--ink)" opacity=".6" />
          <text x="170" y="0" fill="var(--ink)" fontSize="13" textAnchor="middle">{a}</text>
          <text x="258" y="0" fill="var(--ink-2)" fontSize="13" textAnchor="middle">{b}</text>
          {a !== b && <line x1="160" y1="5" x2="268" y2="5" stroke="var(--tense)" strokeWidth=".8" />}
        </g>
      ))}
    </svg>
  );
}

function YearArt() {
  return (
    <svg viewBox="0 0 320 144" className="size-full">
      <line x1="30" y1="72" x2="290" y2="72" stroke="var(--line-2)" />
      {[[50, 140], [110, 200], [170, 260], [210, 280]].map(([a, b], i) => (
        <g key={i}>
          <rect x={a} y={40 + i * 16} width={b - a} height="6" rx="3" fill="var(--gold)" opacity={0.85 - i * 0.15} />
        </g>
      ))}
      {["Jan", "Apr", "Jul", "Oct"].map((m, i) => (
        <text key={m} x={40 + i * 70} y="128" fill="var(--muted)" fontSize="10" fontFamily="var(--font-sans)">{m}</text>
      ))}
    </svg>
  );
}
