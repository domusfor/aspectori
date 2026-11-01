"use client";

import { useEffect, useState } from "react";
import type { SkyResult } from "./astro/types";

let pending: Promise<SkyResult> | null = null;

/** The current sky, fetched once per page view and shared by every component that asks. */
export function useSky() {
  const [sky, setSky] = useState<SkyResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    pending ??= fetch("/api/sky", { signal: AbortSignal.timeout(10_000) }).then((r) => (r.ok ? r.json() : Promise.reject(new Error("sky"))));
    let live = true;
    pending.then((s) => { if (live) setSky(s); }).catch(() => {
      pending = null;
      if (live) setError("The sky snapshot could not be loaded. Please try again.");
    }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [attempt]);
  const retry = () => { pending = null; setError(""); setLoading(true); setAttempt((n) => n + 1); };
  return { sky, error, loading, retry };
}
