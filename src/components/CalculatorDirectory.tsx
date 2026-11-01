"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { CALCULATORS, type CalculatorMode } from "@/data/calculators";

const category = (mode: CalculatorMode) => mode === "synastry" ? "Relationships" : mode === "profections" ? "Timing" : "Birth chart";
const symbols: Record<CalculatorMode, string> = { moon: "☽", rising: "AC", "big-three": "☉", houses: "⌂", synastry: "↔", venus: "♀", mars: "♂", "moon-phase": "◐", "chart-ruler": "♜", profections: "↻" };

export default function CalculatorDirectory() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("All tools");
  const id = useId();
  const results = CALCULATORS.filter((tool) => (group === "All tools" || category(tool.mode) === group) && `${tool.title} ${tool.slug} ${tool.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <section className="mt-9" aria-label="Find an astrology calculator">
    <div className="panel p-5 sm:p-6"><label htmlFor={id} className="kicker text-gold">What would you like to explore?</label><input id={id} type="search" className="field mt-3" placeholder="Try Venus, Moon phase, Rising or profection…" value={query} onChange={(event) => setQuery(event.target.value)} /><div className="flex flex-wrap gap-2 mt-4" aria-label="Filter calculators">{["All tools", "Birth chart", "Relationships", "Timing"].map((name) => <button className={`topic-chip ${group === name ? "is-active" : ""}`} key={name} aria-pressed={group === name} onClick={() => setGroup(name)}>{name}</button>)}</div></div>
    <p role="status" className="text-xs text-muted mt-5">{results.length} free calculator{results.length === 1 ? "" : "s"} · No account required</p>
    <div className="grid gap-5 mt-5 md:grid-cols-2">{results.map((tool) => <Link key={tool.slug} href={`/calculators/${tool.slug}`} className="tool-result-card p-6 hover:border-gold"><div className="flex justify-between items-center gap-4"><p className="kicker text-gold">{category(tool.mode)}</p><span className="font-serif text-3xl text-gold" aria-hidden>{symbols[tool.mode]}</span></div><h2 className="font-serif text-2xl mt-4">{tool.title}</h2><p className="mt-3 text-sm text-ink-2 leading-relaxed">{tool.intro}</p><span className="inline-block mt-5 text-sm text-gold">Open calculator →</span></Link>)}</div>
    {!results.length && <div className="panel p-6 mt-5"><p>No calculators match those filters.</p><button className="btn mt-4" onClick={() => { setQuery(""); setGroup("All tools"); }}>Show all calculators</button></div>}
    <Link href="/" className="tool-shortcut mt-6"><span>Want the complete picture? Create your full birth chart</span><span aria-hidden>→</span></Link>
  </section>;
}
