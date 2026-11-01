"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearch } from "@/lib/use-search";

interface Hit { slug: string; name: string; year: string; category: string; rating: string }

/** Search box over thousands of charts; results come from the server so the page stays light. */
export default function FamousSearch({ total }: { total: number }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const { items: hits, loading, error, settled, retry } = useSearch<Hit>("/api/famous", q);
  const [cursor, setCursor] = useState(0);
  const router = useRouter();
  const listId = useId();

  // Arriving from a search engine's site search: /charts?q=name
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial) Promise.resolve().then(() => { setQ(initial); setOpen(true); });
  }, []);

  const shown = open ? hits : [];
  const move = (next: number) => {
    setCursor(next);
    document.getElementById(`${listId}-${next}`)?.scrollIntoView({ block: "nearest" });
  };
  return (
    <div className="relative" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <input
        className="field !py-4 !text-lg"
        role="combobox"
        aria-label="Search famous birth charts"
        aria-autocomplete="list"
        aria-activedescendant={shown.length ? `${listId}-${cursor}` : undefined}
        aria-describedby={`${listId}-status`}
        aria-busy={loading}
        autoComplete="off"
        maxLength={60}
        aria-expanded={shown.length > 0}
        aria-controls={shown.length ? listId : undefined}
        placeholder={`Search ${total.toLocaleString("en")} famous charts`}
        value={q}
        onChange={(e) => { setQ(e.target.value); setCursor(0); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setOpen(false); return; }
          if (!shown.length) { if (e.key === "ArrowDown") setOpen(true); return; }
          if (e.key === "ArrowDown") { e.preventDefault(); move(Math.min(cursor + 1, shown.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); move(Math.max(cursor - 1, 0)); }
          if (e.key === "Enter") { e.preventDefault(); router.push(`/charts/${shown[cursor].slug}`); }
        }}
      />
      <p id={`${listId}-status`} role="status" className={`mt-2 text-sm ${error ? "text-tense" : "text-muted"}`}>
        {loading ? "Searching charts…" : error ? error : settled && !hits.length ? "No matching charts. Try a surname or another spelling." : settled ? `${hits.length} matching charts. Use the arrow keys to explore.` : "Search by name, or browse the collections below."}
      </p>
      {error && <button type="button" className="mt-2 text-sm text-gold underline" onClick={retry}>Retry search</button>}
      {shown.length > 0 && (
        <ul id={listId} role="listbox" aria-label="Matching famous charts" className="panel absolute left-0 right-0 top-full z-20 mt-1 max-h-[26rem] overflow-auto shadow-2xl" style={{ background: "#0b1222" }}>
          {shown.map((h, i) => (
            <li id={`${listId}-${i}`} key={h.slug} role="option" aria-selected={i === cursor}>
              <Link href={`/charts/${h.slug}`} className={`flex items-baseline justify-between gap-3 px-4 py-3 ${i === cursor ? "bg-[var(--gold-soft)]" : ""}`} onMouseEnter={() => setCursor(i)}>
                <span className="font-serif text-lg">{h.name} <span className="text-xs text-muted">{h.year}</span></span>
                <span className="caps !text-[0.55rem] text-muted">{h.category} · {h.rating}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
