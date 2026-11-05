"use client";

import { saveChart, useSavedChart } from "@/lib/saved-chart";

export default function SaveChart({ encoded }: { encoded: string }) {
  const saved = useSavedChart();
  if (saved === encoded) return <p className="basis-full text-center text-xs text-gold">Saved in this browser only. <button className="underline" onClick={() => saveChart(null)}>Forget it</button></p>;
  return <>
    <button className="btn btn-ghost" onClick={() => saveChart(encoded)}>Save on this device</button>
    <p className="basis-full text-center text-xs text-muted">Reopen it next week without typing. It stays in this browser, not on our servers.</p>
  </>;
}
