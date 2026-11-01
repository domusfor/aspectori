import { InputError } from "./input-error";
import type { BirthInput } from "./types";

/** Validates untrusted JSON into a BirthInput. */
export function parseBirth(raw: unknown): BirthInput {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new InputError("Missing birth date or place.");
  const r = raw as Record<string, unknown>;
  const place = r?.place as Record<string, unknown> | undefined;
  if (typeof r.date !== "string" || !place || typeof place !== "object" || Array.isArray(place)) throw new InputError("Missing birth date or place.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) throw new InputError("Date must be YYYY-MM-DD.");
  const [year, month, day] = r.date.split("-").map(Number);
  if (year < 1800 || year > 2399) throw new InputError("Birth year must be between 1800 and 2399.");
  if (new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) !== r.date) throw new InputError("That date does not exist.");
  const time = r.time === null || r.time === undefined || r.time === "" ? null : r.time;
  if (time !== null && (typeof time !== "string" || !/^(?:[01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time))) {
    throw new InputError("Time must be HH:MM.");
  }
  const lat = place.lat, lon = place.lon;
  const tz = String(place.tz ?? "");
  if (typeof lat !== "number" || typeof lon !== "number" || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    throw new InputError("Pick a birthplace from the list.");
  }
  // supportedValuesOf omits valid IANA aliases such as Asia/Kolkata on some runtimes.
  try { new Intl.DateTimeFormat("en", { timeZone: tz }); }
  catch { throw new InputError("Unknown time zone."); }
  let offset: number | null = null;
  if (r.offset !== null && r.offset !== undefined && r.offset !== "") {
    if (typeof r.offset !== "number") throw new InputError("UTC offset must be a number of minutes.");
    offset = r.offset;
    if (!Number.isFinite(offset) || Math.abs(offset) > 15 * 60) throw new InputError("UTC offset is out of range.");
  }
  return { date: r.date, time, offset, place: { label: String(place.label ?? "").slice(0, 120), lat, lon, tz } };
}
