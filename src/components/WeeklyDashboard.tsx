"use client";

import { useState } from "react";
import Link from "next/link";
import type { Chart } from "@/lib/astro/types";
import { saveChart, useSavedChart } from "@/lib/saved-chart";
import { decodeBirth, encodeBirth } from "@/lib/url";
import { setHash, useHash } from "@/lib/use-hash";
import { useRequest } from "@/lib/use-request";
import BirthForm from "./BirthForm";
import SaveChart from "./SaveChart";
import WeeklyHoroscope from "./WeeklyHoroscope";
import WeeklyReminder from "./WeeklyReminder";

export default function WeeklyDashboard() {
  const hash = useHash();
  const saved = useSavedChart();
  const [remember, setRemember] = useState(false);
  const key = new URLSearchParams(hash ?? "").get("b") ?? saved;
  const birth = decodeBirth(key);
  const chart = useRequest<Chart>("/api/chart", birth);

  if (!birth) return <div className="panel p-5 sm:p-7 max-w-xl">
    <h2 className="kicker text-gold mb-5">Start with your birth details</h2>
    <BirthForm submitLabel="Show my week" onSubmit={(input) => {
      if (remember) saveChart(encodeBirth(input));
      setHash(new URLSearchParams({ b: encodeBirth(input) }));
    }} />
    <label className="mt-4 flex min-h-11 items-center gap-2.5 text-sm text-ink-2 cursor-pointer">
      <input type="checkbox" className="accent-[var(--gold)] size-4" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
      Remember my chart in this browser
    </label>
  </div>;

  return <>
    {chart.loading && <p role="status" className="text-gold">Opening your chart…</p>}
    {chart.error && <p role="alert" className="text-tense">{chart.error} <button className="text-gold underline" onClick={chart.retry}>Try again</button></p>}
    {chart.data && <>
      <WeeklyHoroscope key={key} chart={chart.data} />
      <div className="flex flex-wrap items-center gap-3">
        <WeeklyReminder />
        <SaveChart encoded={encodeBirth(chart.data.input)} />
        <Link className="btn btn-ghost" href={`/#${new URLSearchParams({ b: encodeBirth(chart.data.input) })}`}>Open my full chart</Link>
      </div>
    </>}
  </>;
}
