"use client";

import { useEffect, useState } from "react";

/** A result belongs to one query only; late responses never replace the current list. */
export function useSearch<T>(endpoint: string, query: string) {
  const term = query.trim();
  const [attempt, setAttempt] = useState(0);
  const key = `${endpoint}|${term}|${attempt}`;
  const [result, setResult] = useState<{ key: string; items: T[]; error?: string } | null>(null);
  const enabled = term.length >= 2;

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${endpoint}?q=${encodeURIComponent(term)}`, {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]),
        });
        if (!response.ok) throw new Error(response.status === 429 ? "Too many searches. Try again in a minute." : "Search is unavailable. Please try again.");
        const data = await response.json();
        if (!Array.isArray(data.results)) throw new Error("Search is unavailable. Please try again.");
        if (!controller.signal.aborted) setResult({ key, items: data.results });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ key, items: [], error: error instanceof Error && error.name === "Error" ? error.message : "Could not connect. Check your connection and try again." });
      }
    }, 220);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [enabled, endpoint, term, key]);

  const current = enabled && result?.key === key ? result : null;
  return {
    items: current?.items ?? [],
    error: current?.error,
    loading: enabled && !current,
    settled: Boolean(current),
    retry: () => setAttempt((n) => n + 1),
  };
}
