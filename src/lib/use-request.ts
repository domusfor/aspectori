"use client";

import { useEffect, useState } from "react";
import { post } from "./url";

/** Abort abandoned calculations and expose only results for the current input. */
export function useRequest<T>(url: string, body: unknown | null) {
  const bodyKey = body === null ? null : JSON.stringify(body);
  const [attempt, setAttempt] = useState(0);
  const key = `${url}|${bodyKey}|${attempt}`;
  const [result, setResult] = useState<{ key: string; data?: T; error?: string } | null>(null);

  useEffect(() => {
    if (bodyKey === null) return;
    const controller = new AbortController();
    post<T>(url, JSON.parse(bodyKey), controller.signal)
      .then((data) => { if (!controller.signal.aborted) setResult({ key, data }); })
      .catch((error: Error) => { if (!controller.signal.aborted) setResult({ key, error: error.message }); });
    return () => controller.abort();
  }, [url, bodyKey, key]);

  const current = bodyKey !== null && result?.key === key ? result : null;
  return {
    data: current?.data ?? null,
    error: current?.error,
    loading: bodyKey !== null && !current,
    retry: () => setAttempt((n) => n + 1),
  };
}
