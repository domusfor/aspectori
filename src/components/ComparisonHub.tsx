"use client";

import { useState } from "react";
import Link from "next/link";
import type { BirthInput, Chart, CoupleResult } from "@/lib/astro/types";
import type { FamousMatches } from "@/lib/famous-matches";
import { relationshipOf, type Relationship } from "@/lib/comparison-reading";
import { decodeBirth, encodeBirth } from "@/lib/url";
import { setHash, useHash } from "@/lib/use-hash";
import { useRequest } from "@/lib/use-request";
import BirthForm from "./BirthForm";
import ComparisonResults from "./ComparisonResults";
import MatchShare from "./MatchShare";

export default function ComparisonHub({ chart }: { chart: Chart }) {
  const hash = useHash();
  const params = new URLSearchParams(hash ?? "");
  const partner = decodeBirth(params.get("p"));
  const savedName = (params.get("pn") ?? "").slice(0, 40);
  const relation = relationshipOf(params.get("rel"));
  const [tab, setTab] = useState<"famous" | "person">(partner ? "person" : "famous");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(savedName);
  const [kind, setKind] = useState<Relationship>(relation === "famous" ? "other" : relation);
  const matches = useRequest<FamousMatches>("/api/matches", chart.input);
  const comparison = useRequest<CoupleResult>("/api/couple", partner ? { a: chart.input, b: partner } : null);
  const compare = (birth: BirthInput, label: string, rel: Relationship) => {
    const next = new URLSearchParams(params);
    next.set("b", encodeBirth(chart.input)); next.set("p", encodeBirth(birth));
    next.set("pn", label.trim().slice(0, 40) || "Your person"); next.set("rel", rel);
    if (encodeBirth(birth) === params.get("p")) comparison.retry();
    setHash(next); setTab("person"); setEditing(false);
  };
  const openPersonal = () => { setTab("person"); if (relation === "famous") { setEditing(true); setName(""); setKind("partner"); } };
  return <section id="couple" className="comparison-hub my-10 sm:my-14 scroll-mt-8">
    <div className="flex flex-wrap items-end justify-between gap-5"><div className="max-w-2xl"><p className="kicker text-gold">Your chart is just the beginning</p><h2 className="font-serif text-4xl sm:text-5xl mt-3">Discover your connections.</h2><p className="mt-4 text-ink-2 leading-relaxed">Find familiar names with placements like yours, or bring someone from your own life into the picture.</p></div><span className="text-xs text-muted">Free · Your details are already filled in</span></div>
    <div role="group" aria-label="Choose a comparison" className="grid sm:grid-cols-2 gap-3 mt-7"><button className={`comparison-choice ${tab === "famous" ? "is-active" : ""}`} aria-pressed={tab === "famous"} onClick={() => setTab("famous")}><span className="comparison-choice-icon" aria-hidden>✦</span><span><strong>Famous matches</strong><small>Discover the placements you share</small></span><span aria-hidden>↗</span></button><button className={`comparison-choice ${tab === "person" ? "is-active" : ""}`} aria-pressed={tab === "person"} onClick={openPersonal}><span className="comparison-choice-icon" aria-hidden>◎</span><span><strong>Someone in your life</strong><small>A partner, friend, family member or anyone else</small></span><span aria-hidden>↗</span></button></div>
    {tab === "famous" ? <div className="mt-7">
      {matches.loading && <p className="panel p-6 text-gold" role="status">Finding familiar skies in the famous-chart collection…</p>}
      {matches.error && <p role="alert" className="panel p-5 text-tense">{matches.error} <button className="underline text-gold" onClick={matches.retry}>Retry famous matches</button></p>}
      {matches.data && <><div className="flex flex-wrap justify-between gap-3 mb-5"><p className="text-sm text-ink-2">Suggestions from {matches.data.compared.toLocaleString("en")} famous charts, based on shared Sun, Moon and Rising signs.</p><Link href="/charts" className="text-sm text-gold underline">Browse everyone</Link></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{matches.data.matches.map(({ person, reasons, birth }, index) => <article key={person.slug} className="famous-match-card p-5 sm:p-6"><div className="flex items-center gap-4"><div className={`match-monogram match-tone-${index % 3}`} aria-hidden>{person.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><div className="min-w-0"><p className="kicker text-muted !text-[0.56rem]">{person.category}</p><h3 className="font-serif text-2xl mt-1">{person.name}</h3></div></div><p className="text-sm text-ink-2 leading-relaxed mt-4 min-h-10">{person.blurb}</p><ul className="flex flex-wrap gap-2 mt-4">{reasons.map((reason) => <li className={`match-reason ${reason.certain ? "" : "is-possible"}`} key={`${reason.point}-${reason.sign}`}>{reason.certain ? "Shared" : "Possible"} {reason.sign} {reason.point}</li>)}</ul><p className="text-xs text-muted mt-4">{person.rating === "X" ? "Birth time unknown · Rising not compared" : `Recorded time · Rodden ${person.rating}${person.rating === "C" ? " (use with caution)" : ""}`}</p><div className="grid gap-3 mt-5"><button className="btn btn-solid w-full" onClick={() => compare(birth, person.name, "famous")}>Compare with {person.name.split(" ")[0]}</button><MatchShare name={person.name} slug={person.slug} placements={reasons.filter((reason) => reason.certain).map((reason) => `${reason.sign} ${reason.point}`)} /><Link href={`/charts/${person.slug}`} className="text-xs text-gold text-center underline underline-offset-4">View chart & sources</Link></div></article>)}</div>{!matches.data.matches.length && <p className="panel p-5">No shared placements were found. You can still compare with anyone in the directory or enter someone’s details.</p>}<details className="text-xs text-muted mt-5 leading-relaxed"><summary className="cursor-pointer text-gold py-2">Why these people? How matching works</summary><p className="max-w-3xl mt-2">We prioritize the number of definite shared Sun, Moon and Rising signs, then possible overlaps, then the collection’s existing popularity order. A possible match means a sign can change during an unknown-time day. These are chart similarities, not a compatibility percentage, personality equivalence or a claim about a real relationship.</p></details></>}
    </div> : <div className="mt-7">
      {(!partner || editing) && <div className="grid md:grid-cols-[1fr_1.1fr] gap-6 connection-entry p-5 sm:p-8"><div><p className="kicker text-gold">Make room for their sky</p><h3 className="font-serif text-3xl sm:text-4xl mt-3">Two people.<br />More to understand.</h3><p className="text-sm leading-relaxed text-ink-2 mt-5 max-w-sm">Your own chart is ready. Add their birth details to explore the contacts between you. An unknown birth time is welcome—we’ll show the limits clearly.</p><label className="block text-sm mt-6 text-ink-2" htmlFor="comparison-name">Their first name or a label <span className="text-muted">(optional)</span></label><input id="comparison-name" className="field mt-2 w-full" value={name} maxLength={40} placeholder="e.g. Alex" onChange={(event) => setName(event.target.value)} /><label className="block text-sm text-ink-2 mt-4" htmlFor="comparison-kind">What brings you together?</label><select id="comparison-kind" className="field mt-2 w-full" value={kind} onChange={(event) => setKind(relationshipOf(event.target.value))}><option value="partner">Partner / dating</option><option value="friend">Friendship</option><option value="family">Family</option><option value="other">Another connection</option></select><p className="text-xs text-muted mt-4">This changes the reflection prompts, not the calculation. Names and birth details stay in the shareable link; share it thoughtfully.</p></div><div className="panel p-5 sm:p-6"><h4 className="kicker text-gold mb-5">Their birth details</h4><BirthForm key={editing && relation === "famous" ? "new-person" : params.get("p") ?? "new-person"} initial={editing && relation === "famous" ? null : partner} busy={comparison.loading} submitLabel="Compare our charts" onSubmit={(birth) => compare(birth, name, kind)} />{editing && partner && <button className="text-sm text-gold underline mt-4" onClick={() => setEditing(false)}>Cancel editing</button>}</div></div>}
      {comparison.loading && <p role="status" className="panel p-6 mt-5 text-gold">Bringing your two charts together…</p>}
      {comparison.error && <p role="alert" className="panel p-5 mt-5 text-tense">{comparison.error} <button className="text-gold underline" onClick={comparison.retry}>Retry comparison</button></p>}
      {comparison.data && !editing && <ComparisonResults key={`${params.get("p")}-${relation}`} result={comparison.data} name={savedName || "Your person"} relationship={relation} onEdit={() => { setName(savedName); setKind(relation === "famous" ? "other" : relation); setEditing(true); }} />}
    </div>}
  </section>;
}
