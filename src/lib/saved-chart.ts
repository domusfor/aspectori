"use client";

import { useSyncExternalStore } from "react";

// Opt-in only. The chart stays in this browser and is never sent anywhere until the
// person opens it, which then works exactly like a chart they typed in.
const KEY = "aspectori:saved-chart";
const EVENT = "aspectori:saved-chart";

const read = () => {
  try { return window.localStorage.getItem(KEY); }
  catch { return null; }
};

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

/** The encoded birth details saved on this device, or null. */
export const useSavedChart = () => useSyncExternalStore(subscribe, read, () => null);

export function saveChart(encoded: string | null) {
  try {
    if (encoded) window.localStorage.setItem(KEY, encoded);
    else window.localStorage.removeItem(KEY);
  } catch { /* Storage can be blocked; the chart link still works. */ }
  window.dispatchEvent(new Event(EVENT));
}
