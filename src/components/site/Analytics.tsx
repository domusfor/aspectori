"use client";

import { useEffect } from "react";
import Link from "next/link";
import { chooseAnalytics, startAnalytics, useAnalyticsChoice } from "@/lib/analytics";

/** Google Tag Manager loads only after someone accepts. Declining sends nothing to Google. */
export default function Analytics() {
  const choice = useAnalyticsChoice();
  useEffect(() => { if (choice === "granted") startAnalytics(); }, [choice]);
  if (choice !== null) return null;
  return <aside aria-label="Analytics choice" className="no-print fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-2xl flex-wrap items-center gap-x-5 gap-y-3 rounded-[3px] border border-[var(--line-2)] bg-[#0b1222] p-4 shadow-2xl">
    <p className="min-w-60 flex-1 text-sm leading-relaxed text-ink-2">May we use Google Analytics cookies to see which pages help people? We never send your birth details. <Link className="text-gold underline" href="/privacy#analytics">Privacy</Link></p>
    <div className="flex gap-2">
      <button type="button" className="btn btn-ghost" onClick={() => chooseAnalytics("denied")}>Decline</button>
      <button type="button" className="btn btn-solid" onClick={() => chooseAnalytics("granted")}>Accept</button>
    </div>
  </aside>;
}

export function AnalyticsSettings() {
  const choice = useAnalyticsChoice();
  if (choice === "pending" || choice === null) return null;
  const next = choice === "granted" ? "denied" : "granted";
  return <button type="button" className="min-h-6 text-left hover:text-ink" onClick={() => chooseAnalytics(next)}>{choice === "granted" ? "Turn off analytics" : "Turn on analytics"}</button>;
}
