"use client";

import { useId, useState } from "react";
import type { BirthInput, Place } from "@/lib/astro/types";
import { DateField, TimeField } from "./DateTimeFields";
import { useSearch } from "@/lib/use-search";
import { minutesToOffset, offsetToMinutes } from "@/lib/offset";

interface Props {
  initial?: BirthInput | null;
  submitLabel: string;
  busy?: boolean;
  onSubmit: (input: BirthInput) => void;
}

export default function BirthForm({ initial, submitLabel, busy, onSubmit }: Props) {
  const [date, setDate] = useState(initial?.date ?? "");
  const [time, setTime] = useState(initial?.time ?? "");
  const [unknown, setUnknown] = useState(initial ? initial.time === null : false);
  const [place, setPlace] = useState<Place | null>(initial?.place ?? null);
  const [offsetText, setOffsetText] = useState(initial?.offset != null ? minutesToOffset(initial.offset) : "");
  const id = useId();

  const offset = initial?.offset != null && offsetText === minutesToOffset(initial.offset)
    ? initial.offset : offsetText.trim() ? offsetToMinutes(offsetText) : null;
  const offsetBad = offsetText.trim() !== "" && offset === null;
  const ready = date && place && (unknown || time) && !offsetBad;

  return (
    <form
      className="birth-form grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready && !busy) onSubmit({ date, time: unknown ? null : time, place: place!, offset });
      }}
    >
      <DateField value={date} onChange={setDate} />
      <TimeField value={time} onChange={setTime} disabled={unknown} />
      <label htmlFor={`${id}-unknown`} className="-mt-1 flex min-h-11 items-center gap-2.5 text-sm text-ink-2 cursor-pointer select-none">
        <input id={`${id}-unknown`} type="checkbox" className="accent-[var(--gold)] size-4" checked={unknown} onChange={(e) => setUnknown(e.target.checked)} />
        I don&apos;t know my birth time
      </label>
      {unknown && <p className="text-xs leading-relaxed text-ink-2">You can still explore your planets. Rising and houses will be hidden, and any signs that change during the day will be marked.</p>}
      <CityInput value={place} onChange={setPlace} />
      <details className="group text-sm" open={offsetText !== ""}>
        <summary className="caps text-muted cursor-pointer list-none hover:text-ink">
          <span className="group-open:hidden">+ Time zone</span>
          <span className="hidden group-open:inline">− Time zone</span>
        </summary>
        <label className="grid gap-1.5 mt-3">
          <span className="text-xs text-muted leading-relaxed">
            Leave empty to use the historical offset for that date and place, including summer time and war time. Fill it
            in only if your birth certificate gives a different one.
          </span>
          <input
            className="field"
            inputMode="text"
            placeholder="Automatic   e.g. +02:00 or −05:00"
            value={offsetText}
            aria-invalid={offsetBad}
            onChange={(e) => setOffsetText(e.target.value)}
          />
          {offsetBad && <span className="text-xs text-tense">Use the form +02:00 or -05:30.</span>}
        </label>
      </details>
      <button className="btn btn-solid mt-1" type="submit" disabled={!ready || busy}>
        {busy ? "Calculating…" : submitLabel}
      </button>
      <p className="text-xs text-muted leading-relaxed text-center">No account needed. Your birth details are sent to calculate your chart and are not stored by us.</p>
    </form>
  );
}

function CityInput({ value, onChange }: { value: Place | null; onChange: (p: Place | null) => void }) {
  const [q, setQ] = useState(value?.label ?? "");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const { items: results, loading, error, settled, retry } = useSearch<Place>("/api/cities", value ? "" : q);
  const id = useId();
  const listId = `${id}-list`;
  const expanded = open && results.length > 0;

  const choose = (place: Place) => {
    setQ(place.label);
    onChange(place);
    setOpen(false);
  };
  const move = (next: number) => {
    setCursor(next);
    document.getElementById(`${id}-option-${next}`)?.scrollIntoView({ block: "nearest" });
  };

  return (
    <div className="grid gap-1.5 relative">
      <label htmlFor={id} className="caps text-muted">Place of birth</label>
      <input
        id={id}
        className="field"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={expanded ? listId : undefined}
        aria-activedescendant={expanded ? `${id}-option-${cursor}` : undefined}
        aria-describedby={`${id}-status`}
        aria-busy={loading}
        autoComplete="off"
        placeholder="Search your birth city"
        maxLength={80}
        value={q}
        required
        onChange={(e) => { setQ(e.target.value); onChange(null); setCursor(0); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setOpen(false); return; }
          if (!results.length) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); move(open ? Math.min(cursor + 1, results.length - 1) : 0); }
          if (e.key === "ArrowUp") { e.preventDefault(); setOpen(true); move(Math.max(cursor - 1, 0)); }
          if (e.key === "Enter" && expanded) { e.preventDefault(); choose(results[cursor]); }
        }}
      />
      <span id={`${id}-status`} role="status" className={`text-xs leading-relaxed ${error ? "text-tense" : "text-muted"}`}>
        {value ? `${fmtCoord(value.lat, "N", "S")} · ${fmtCoord(value.lon, "E", "W")} · ${value.tz}`
          : loading ? "Searching cities…"
          : error ? error
          : settled && !results.length ? "No cities found. Try another spelling or a nearby town."
          : settled ? `${results.length} places found. Choose your birthplace from the list.`
          : "Enter at least two letters, then select a city from the list."}
      </span>
      {error && <button type="button" className="text-sm text-gold underline justify-self-start" onClick={() => { retry(); setOpen(true); }}>Retry city search</button>}
      {expanded && (
        <ul id={listId} role="listbox" aria-label="Birthplace suggestions" className="absolute top-full left-0 right-0 z-20 mt-1 panel max-h-72 overflow-auto shadow-2xl" style={{ background: "#0b1222" }}>
          {results.map((place, i) => (
            <li
              id={`${id}-option-${i}`}
              key={`${place.label}-${place.lat}-${place.lon}`}
              role="option"
              aria-selected={i === cursor}
              className={`px-3 py-3 text-sm cursor-pointer ${i === cursor ? "bg-[var(--gold-soft)]" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(place)}
              onMouseEnter={() => setCursor(i)}
            >
              {place.label}
              <span className="block text-xs text-muted">{place.tz}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const fmtCoord = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? pos : neg}`;
