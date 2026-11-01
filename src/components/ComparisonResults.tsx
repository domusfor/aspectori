"use client";

import { useState } from "react";
import Link from "next/link";
import type { CoupleResult } from "@/lib/astro/types";
import { contactReading, contactTopic, TOPICS, type ContactTopic, type Relationship } from "@/lib/comparison-reading";
import { aspectOrbLabel } from "@/lib/astro/library";
import { pointMap, positionLabel } from "@/lib/astro/reading";
import { encodeBirth } from "@/lib/url";
import Wheel from "./Wheel";
import HouseOverlays from "./HouseOverlays";

export default function ComparisonResults({ result, name = "Your person", relationship = "other", onEdit }: { result: CoupleResult; name?: string; relationship?: Relationship; onEdit?: () => void }) {
  const [topic, setTopic] = useState<ContactTopic | "all">("all");
  const known = result.a.timeKnown && result.b.timeKnown;
  const a = pointMap(result.a), b = pointMap(result.b);
  const contacts = result.allContacts.filter((contact) => topic === "all" || contactTopic(contact) === topic);
  const report = `/report#${new URLSearchParams({ b: encodeBirth(result.a.input), p: encodeBirth(result.b.input), pn: name, rel: relationship })}`;
  return <section id="comparison-results" className="scroll-mt-8 mt-8">
    <div className="connection-result p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="kicker text-gold">Your charts together</p><h3 className="font-serif text-4xl sm:text-5xl mt-3 break-words">You & {name}</h3><p className="mt-3 text-sm text-ink-2">{result.allContacts.length} qualifying contacts · {known ? "Both birth times provided" : "Birth-time uncertainty preserved"}</p></div><div className="flex flex-wrap gap-2"><Link className="btn btn-solid" href={report}>Download comparison PDF</Link>{onEdit && <button className="btn btn-ghost" onClick={onEdit}>Edit person</button>}</div></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 max-w-2xl mx-auto mt-8">
        {[{ chart: result.a, label: "Your sky" }, { chart: result.b, label: name }].map(({ chart, label }, i) => <div key={i} className="text-center min-w-0"><Wheel chart={chart} sys="whole" className="w-full max-w-[320px] mx-auto" /><p className="kicker text-gold mt-2 break-words">{label}</p><p className="text-xs text-muted mt-2">{chart.moment.localLabel}</p></div>)}
      </div>
      <p className="text-sm leading-relaxed text-ink-2 mt-7 max-w-3xl">Use this as a guide to questions and patterns you can explore together. Astrological contacts cannot measure love, friendship, consent or relationship success.{relationship === "famous" ? " A famous-person comparison is an exploration of chart symbolism, not evidence of a personal connection." : " Your lived experience matters more than a chart interpretation."}</p>
      {!known && <p className="mt-4 rounded border border-gold/30 bg-gold/5 p-4 text-sm text-gold">A birth time is missing. We omit the unknown Rising sign and retain contacts supported by both local-day endpoints. Orb ranges describe those samples, not every moment in between. Fewer listed contacts do not mean a weaker relationship.</p>}
    </div>
    <div className="mt-8"><p className="kicker text-muted mb-4">Explore the conversation</p><div aria-label="Filter comparison topics" className="flex flex-wrap gap-2"><button className={`topic-chip ${topic === "all" ? "is-active" : ""}`} aria-pressed={topic === "all"} onClick={() => setTopic("all")}>All contacts <span>{result.allContacts.length}</span></button>{(Object.keys(TOPICS) as ContactTopic[]).map((key) => <button key={key} aria-pressed={topic === key} className={`topic-chip ${topic === key ? "is-active" : ""}`} onClick={() => setTopic(key)}>{TOPICS[key].label} <span>{result.allContacts.filter((c) => contactTopic(c) === key).length}</span></button>)}</div></div>
    <div className="grid gap-4 mt-5 md:grid-cols-2" aria-live="polite">
      {!contacts.length && <p className="panel p-6 text-ink-2 md:col-span-2">No contacts meet our calculation rules in this category. This does not mean the topic is absent from your relationship.</p>}
      {contacts.map((contact, i) => {
        const reading = contactReading(contact, relationship);
        return <article key={`${contact.a}-${contact.b}-${contact.type}`} className="contact-detail p-5 sm:p-6"><div className="flex justify-between gap-3 items-center"><p className="kicker text-gold !text-[0.6rem]">{TOPICS[reading.topic].label}</p><span className="text-xs text-muted tabular-nums">{aspectOrbLabel(contact, known)} orb</span></div><h4 className="font-serif text-2xl mt-3">{reading.title}</h4><p className="text-sm leading-relaxed text-ink-2 mt-3">{reading.interpretation}</p><details className="mt-4" open={i === 0}><summary className="text-xs text-gold cursor-pointer py-2">Meaning, evidence & a question to try</summary><p className="text-sm leading-relaxed text-ink-2 mt-2">{reading.geometry}</p><div className="contact-evidence mt-4 text-xs leading-relaxed"><p>You: {positionLabel(a[contact.a])}</p><p>{name}: {positionLabel(b[contact.b])}</p><p className="text-muted mt-1">Aspect angle: {reading.angle}° · Orb: {aspectOrbLabel(contact, known)}</p></div><p className="mt-4 text-sm font-medium text-gold">{reading.prompt}</p></details></article>;
      })}
    </div>
    <HouseOverlays result={result} name={name} />
    <details className="mt-6 panel p-5 text-sm"><summary className="cursor-pointer text-gold">How this comparison is calculated</summary><p className="text-ink-2 leading-relaxed mt-3">Tropical, geocentric positions from Swiss Ephemeris. The comparison uses conjunctions, sextiles, squares, trines and oppositions at 75% of the natal orb limits. Contacts involving personal planets are prioritized; slow-planet pairs, the Midheaven, Chiron and node are excluded from aspects. The two wheels use whole sign houses where times are known. They are individual charts, not a composite chart. The house-overlay tables separately place all ten planets in the other person’s house sectors.</p><p className="mt-3 text-muted">Relationship type changes the reflection questions, never the astronomical calculation. <Link className="text-gold underline" href="/learn/aspects-and-orbs">Understand aspects and orbs</Link> · <a className="text-gold underline" href="https://www.astro.com/astrowiki/en/Synastry">Astrodienst introduction to synastry</a></p></details>
  </section>;
}
