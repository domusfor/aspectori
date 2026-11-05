"use client";

import { useSyncExternalStore } from "react";

// Birth data lives in the URL fragment. Browsers never send the fragment to a server,
// so it cannot end up in request logs or Referer headers. Analytics scripts run in the
// page and could read it, so lib/analytics.ts reports only the origin and path.
export const HASH_EVENT = "aspectori:hash";
const EVENT = HASH_EVENT;

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("hashchange", cb);
    window.removeEventListener(EVENT, cb);
  };
}

/** The fragment as URLSearchParams source text, or null during server render / hydration. */
export function useHash(): string | null {
  return useSyncExternalStore(subscribe, () => window.location.hash.slice(1), () => null);
}

export function setHash(next: URLSearchParams) {
  const s = next.toString();
  history.replaceState(null, "", s ? `#${s}` : window.location.pathname);
  window.dispatchEvent(new Event(EVENT));
}
