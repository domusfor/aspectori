import type { BirthInput } from "./astro/types";
import { parseBirth } from "./astro/parse";

// The page address is the save file: no accounts, no email gate.
// Format: date~time~lat~lon~tz~label[~offsetMinutes]
const SEP = "~";

export function encodeBirth(b: BirthInput) {
  const parts: (string | number)[] = [b.date, b.time ?? "", b.place.lat, b.place.lon, b.place.tz, b.place.label.replaceAll(SEP, " ")];
  if (b.offset !== null && b.offset !== undefined) parts.push(b.offset);
  return parts.join(SEP);
}

export function decodeBirth(s: string | null): BirthInput | null {
  if (!s || s.length > 1000) return null;
  const parts = s.split(SEP);
  if (parts.length < 6 || parts.length > 7) return null;
  const [date, time, lat, lon, tz, label, offset] = parts;
  if (!lat.trim() || !lon.trim()) return null;
  try {
    return parseBirth({ date, time: time || null, place: { lat: Number(lat), lon: Number(lon), tz, label }, offset: offset ? Number(offset) : null });
  } catch { return null; }
}

export async function post<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const timeout = AbortSignal.timeout(45_000);
  let res: Response;
  try {
    res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(timeout.aborted ? "This is taking longer than expected. Please try again." : "Could not connect. Check your connection and try again.");
  }
  const data = await res.json().catch(() => { throw new Error("The server returned an unreadable response. Please try again."); });
  if (!res.ok) throw new Error(data.error ?? (res.status === 429 ? "Too many requests. Try again in a minute." : "Something went wrong."));
  return data as T;
}

export function fmtDate(iso: string, withYear = true) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}), timeZone: "UTC",
  });
}
