"use client";

import { useState } from "react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR - 1800 + 1 }, (_, i) => THIS_YEAR - i);
const pad = (n: number) => String(n).padStart(2, "0");
const daysIn = (y: number, m: number) => new Date(Date.UTC(y || 2000, m, 0)).getUTCDate();

/**
 * Day / month / year as three selects. On phones each opens the native wheel picker,
 * which beats a calendar for a date decades ago. On desktop, typing "1990" jumps there.
 */
export function DateField({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const [y0, m0, d0] = value ? value.split("-").map(Number) : [0, 0, 0];
  const [parts, setParts] = useState({ y: y0, m: m0, d: d0 });

  const update = (next: Partial<typeof parts>) => {
    const p = { ...parts, ...next };
    if (p.y && p.m && p.d > daysIn(p.y, p.m)) p.d = daysIn(p.y, p.m);
    setParts(p);
    onChange(p.y && p.m && p.d ? `${p.y}-${pad(p.m)}-${pad(p.d)}` : "");
  };
  const maxDay = parts.m ? daysIn(parts.y, parts.m) : 31;

  return (
    <fieldset className="birth-date grid gap-1.5">
      <legend className="caps text-muted mb-1.5">Date of birth</legend>
      <div className="birth-date-parts">
        <select className="field birth-month" aria-label="Month" data-empty={!parts.m} value={parts.m || ""} onChange={(e) => update({ m: Number(e.target.value) })} required>
          <option value="" disabled>Month</option>
          {MONTHS.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
        </select>
        <select className="field" aria-label="Day" data-empty={!parts.d} value={parts.d || ""} onChange={(e) => update({ d: Number(e.target.value) })} required>
          <option value="" disabled>Day</option>
          {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="field" aria-label="Year" data-empty={!parts.y} value={parts.y || ""} onChange={(e) => update({ y: Number(e.target.value) })} required>
          <option value="" disabled>Year</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </fieldset>
  );
}

/** Hour and minute selects, 24-hour with the 12-hour reading beside it so nobody has to convert. */
export function TimeField({ value, onChange, disabled }: { value: string; onChange: (hhmm: string) => void; disabled?: boolean }) {
  const [h0, m0] = value ? value.split(":") : ["", ""];
  const [parts, setParts] = useState({ h: h0, m: m0 });

  const update = (next: Partial<typeof parts>) => {
    const p = { ...parts, ...next };
    if (p.h !== "" && p.m === "") p.m = "00";
    setParts(p);
    onChange(p.h !== "" && p.m !== "" ? `${p.h}:${p.m}` : "");
  };

  return (
    <fieldset className="grid gap-1.5" disabled={disabled}>
      <legend className="caps text-muted mb-1.5">Time of birth</legend>
      <div className="grid grid-cols-2 gap-2">
        <select className="field" aria-label="Hour" data-empty={parts.h === ""} value={disabled ? "" : parts.h} onChange={(e) => update({ h: e.target.value })} required={!disabled}>
          <option value="" disabled>Hour</option>
          {Array.from({ length: 24 }, (_, h) => (
            <option key={h} value={pad(h)}>{pad(h)} · {h % 12 || 12} {h < 12 ? "am" : "pm"}</option>
          ))}
        </select>
        <select className="field" aria-label="Minute" data-empty={parts.m === ""} value={disabled ? "" : parts.m} onChange={(e) => update({ m: e.target.value })} required={!disabled}>
          <option value="" disabled>Minute</option>
          {Array.from({ length: 60 }, (_, m) => <option key={m} value={pad(m)}>:{pad(m)}</option>)}
        </select>
      </div>
    </fieldset>
  );
}
