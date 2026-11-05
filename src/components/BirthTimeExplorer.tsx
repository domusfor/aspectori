"use client";

import { useState } from "react";
import Link from "next/link";
import type { BirthTimeResult, BirthTimeSegment } from "@/lib/astro/birth-time";
import type { Place } from "@/lib/astro/types";
import { risingGuideSlug } from "@/lib/astro/signs";
import { fmtPos } from "@/lib/astro/zodiac";
import { decodeBirth, encodeBirth } from "@/lib/url";
import { useHash } from "@/lib/use-hash";
import { useRequest } from "@/lib/use-request";
import { CityInput } from "./BirthForm";
import { DateField, TimeField } from "./DateTimeFields";

const duration = (minutes: number) => minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")} min`;

export default function BirthTimeExplorer() {
  const hash = useHash();
  const key = new URLSearchParams(hash ?? "").get("b");
  return <Explorer key={key ?? "new"} initial={key} />;
}

function Explorer({ initial }: { initial: string | null }) {
  const start = decodeBirth(initial);
  const [date, setDate] = useState(start?.date ?? "");
  const [from, setFrom] = useState(start?.time ? start.time.slice(0, 2) + ":00" : "");
  const [to, setTo] = useState("");
  const [place, setPlace] = useState<Place | null>(start?.place ?? null);
  const [query, setQuery] = useState<object | null>(null);
  const request = useRequest<BirthTimeResult>("/api/birth-time", query);
  const ready = Boolean(date && from && to && place);

  return <div className="grid gap-6" id="calculator">
    <noscript><p className="panel p-5">Enable JavaScript to explore a time window. The guide and questions below are available without it.</p></noscript>
    <form className="panel birth-form grid gap-4 p-5 sm:p-7 md:grid-cols-2" onSubmit={(event) => {
      event.preventDefault();
      if (ready) setQuery({ date, from, to, place, offset: start?.offset ?? null });
    }}>
      <div className="grid gap-4"><DateField value={date} onChange={setDate} /><CityInput value={place} onChange={setPlace} /></div>
      <div className="grid gap-4 content-start">
        <TimeField legend="Earliest possible time" value={from} onChange={setFrom} />
        <TimeField legend="Latest possible time" value={to} onChange={setTo} />
      </div>
      <button className="btn btn-solid md:col-span-2" type="submit" disabled={!ready || request.loading}>{request.loading ? "Calculating…" : "Show what could change"}</button>
    </form>
    {request.error && <p role="alert" className="text-tense">{request.error}</p>}
    {request.data && <Result result={request.data} />}
    {request.data && date && place && <p className="text-sm text-ink-2">Found your time? <Link className="text-gold underline" href={`/#${new URLSearchParams({ b: encodeBirth({ date, time: request.data.from, place, offset: start?.offset ?? null }) })}`}>Open the full chart</Link> and enter it there.</p>}
  </div>;
}

function Result({ result }: { result: BirthTimeResult }) {
  const [picked, setPicked] = useState(0);
  const segment: BirthTimeSegment = result.segments[picked] ?? result.segments[0];
  const count = result.segments.length;
  const names = [...new Set(result.segments.map((s) => s.rising))];
  return <section aria-live="polite" className="panel p-5 sm:p-7">
    <p className="kicker text-gold">{result.from} to {result.to} · {duration(result.totalMinutes)}</p>
    <h2 className="font-serif text-3xl sm:text-4xl mt-2">{names.length === 1 ? `Your Rising sign is ${names[0]} across this whole window.` : `${names.length} Rising signs are possible in this window.`}</h2>
    <div className="mt-6 flex h-14 overflow-hidden rounded-[3px] border border-[var(--line-2)]" role="group" aria-label="Rising signs across your time window">
      {result.segments.map((s, i) => <button key={`${s.from}-${s.rising}`} type="button" aria-pressed={i === picked} onClick={() => setPicked(i)} aria-label={`${s.rising} Rising, ${s.from} to ${s.to}`} style={{ flexGrow: s.minutes, flexBasis: 0 }} className={`min-w-0 overflow-hidden whitespace-nowrap px-1 text-xs ${i === picked ? "bg-[var(--gold)] text-[#070b14]" : "bg-[var(--gold-soft)] text-ink"} ${i ? "border-l border-[var(--line-2)]" : ""}`}>{s.minutes / result.totalMinutes > 0.09 ? s.rising : ""}</button>)}
    </div>
    <ol className="mt-5 grid gap-2 sm:grid-cols-2">{result.segments.map((s, i) => <li key={`row-${s.from}-${s.rising}`}><button type="button" onClick={() => setPicked(i)} aria-pressed={i === picked} className={`panel flex w-full min-h-11 justify-between gap-3 px-4 py-2 text-left text-sm ${i === picked ? "!border-[var(--gold)]" : ""}`}><span>{s.rising}</span><span className="tabular-nums text-muted">{s.from}–{s.to} · {duration(s.minutes)}</span></button></li>)}</ol>
    <div className="mt-6 border-t border-line pt-5">
      <h3 className="font-serif text-2xl">{segment.rising} Rising, {segment.from} to {segment.to}</h3>
      <dl className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
        <div><dt className="inline text-muted">Ascendant in this stretch: </dt><dd className="inline">{fmtPos(segment.ascFrom)} to {fmtPos(segment.ascTo)}</dd></div>
        <div><dt className="inline text-muted">Whole sign houses: </dt><dd className="inline">Sun in {segment.sunHouse}, Moon in {segment.moonHouse}</dd></div>
      </dl>
      <Link className="mt-3 inline-flex min-h-11 items-center text-sm text-gold underline" href={`/learn/${risingGuideSlug(segment.rising)}`}>Read about {segment.rising} Rising</Link>
    </div>
    <ul className="mt-3 grid gap-2 text-sm text-ink-2">
      {result.moonChangeAt ? <li className="text-gold">The Moon also changes from {result.moonSigns[0]} to {result.moonSigns[1]} at {result.moonChangeAt}, so your Moon sign depends on this time too.</li> : <li>Your Moon stays in {result.moonSigns[0]} throughout this window.</li>}
      {count > 1 && <li>Each change moves every planet’s whole sign house by one. Placidus cusps shift continuously, so check them on the full chart once you have a time.</li>}
      {result.notes.map((note) => <li key={note} className="text-gold">{note}</li>)}
    </ul>
    <p className="mt-4 text-xs text-muted">Calculated by the Swiss Ephemeris for this date and birthplace. Change times are shown to the minute on the birthplace clock, but a recorded birth time is rarely that precise, so treat a time close to a change with caution.</p>
  </section>;
}
