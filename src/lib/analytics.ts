"use client";

import { useSyncExternalStore } from "react";

export const GTM_ID = "GTM-PRGH9HDZ";
const KEY = "aspectori:analytics-consent";
const EVENT = "aspectori:analytics-consent";

export type AnalyticsChoice = "granted" | "denied";

const read = (): AnalyticsChoice | null => {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch { return null; }
};

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

/** "pending" during server render, so the banner never flashes for someone who already chose. */
export const useAnalyticsChoice = () => useSyncExternalStore<AnalyticsChoice | "pending" | null>(subscribe, read, () => "pending");

export function chooseAnalytics(choice: AnalyticsChoice) {
  const withdrawing = choice === "denied" && read() === "granted";
  try { window.localStorage.setItem(KEY, choice); } catch { /* Blocked storage: the choice lasts for this page only. */ }
  window.dispatchEvent(new Event(EVENT));
  // Tag Manager cannot be unloaded from a running page, so withdrawing needs a clean one.
  if (withdrawing) window.location.reload();
}

/**
 * The address fragment holds birth details (see use-hash.ts). What analytics may report
 * is the origin and path only, and it is reset before any history listener can read it.
 */
export const safeLocation = (location: Pick<Location, "origin" | "pathname">) => `${location.origin}${location.pathname}`;

type Gtag = (...args: unknown[]) => void;
declare global { interface Window { dataLayer?: unknown[]; gtag?: Gtag } }

let started = false;

export function startAnalytics() {
  if (started) return;
  started = true;
  window.dataLayer = window.dataLayer || [];
  // Google's tag reads `arguments` objects from the data layer, so this cannot be an arrow function.
  window.gtag = function gtag() { window.dataLayer!.push(arguments); }; // eslint-disable-line prefer-rest-params
  const report = () => window.gtag!("set", { page_location: safeLocation(window.location), page_referrer: "" });
  for (const method of ["pushState", "replaceState"] as const) {
    const original = history[method];
    history[method] = function patched(...args: Parameters<History["pushState"]>) {
      const result = original.apply(this, args);
      report();
      return result;
    };
  }
  window.addEventListener("hashchange", report);
  window.gtag("js", new Date());
  report();
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
}
