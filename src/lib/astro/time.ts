import { DateTime } from "luxon";
import { InputError } from "./input-error";
export { InputError } from "./input-error";

export type OffsetSource = "tz" | "lmt" | "manual";

export interface ResolvedMoment {
  utc: DateTime;
  /** Wall-clock label at the birthplace, e.g. "14 Mar 1879, 11:30". */
  localLabel: string;
  /** Minutes east of UTC actually used (may be fractional for mean time). */
  offset: number;
  source: OffsetSource;
  notes: string[];
}

interface Where {
  tz: string;
  lon: number;
  /** Manual override, minutes east of UTC. */
  offset?: number | null;
}

const parseDate = (date: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) throw new InputError("Date must be YYYY-MM-DD.");
  const [, y, mo, d] = m.map(Number);
  if (y < 1800 || y > 2399) throw new InputError("Birth year must be between 1800 and 2399.");
  const probe = DateTime.utc(y, mo, d);
  if (!probe.isValid || probe.day !== d) throw new InputError("That date does not exist.");
  return { year: y, month: mo, day: d };
};

export function parseTime(time: string) {
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(time);
  if (!m) throw new InputError("Time must be HH:MM.");
  const [hour, minute, second] = [Number(m[1]), Number(m[2]), Number(m[3] ?? 0)];
  if (hour > 23 || minute > 59 || second > 59) throw new InputError("Time must be HH:MM.");
  return { hour, minute, second };
}

export function fmtOffset(minutes: number) {
  const sign = minutes < 0 ? "−" : "+";
  const total = Math.round(Math.abs(minutes) * 60);
  const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
  return `UTC${sign}${h}:${String(m).padStart(2, "0")}${s ? ":" + String(s).padStart(2, "0") : ""}`;
}

/**
 * True while a zone is still in its first, local-mean-time period: the offset is not a
 * round quarter hour and has not changed since 1800. The tz database gives that period
 * the mean time of the zone's reference city (Berlin, Madrid…); before standard time the
 * clocks at the birthplace ran on the birthplace's own mean time, which is what Astro.com uses.
 */
function inLmtPeriod(tz: string, local: DateTime) {
  const off = local.offset;
  if (Number.isInteger(off / 15)) return false;
  let t = DateTime.fromObject({ year: 1800, month: 1, day: 1 }, { zone: tz });
  while (t < local) {
    if (t.offset !== off) return false;
    t = t.plus({ months: 3 });
  }
  return true;
}

function fromOffset(ymd: ReturnType<typeof parseDate>, hms: ReturnType<typeof parseTime>, offset: number) {
  return DateTime.utc(ymd.year, ymd.month, ymd.day, hms.hour, hms.minute, hms.second).minus({ milliseconds: Math.round(offset * 60_000) });
}

function resolve(ymd: ReturnType<typeof parseDate>, hms: ReturnType<typeof parseTime>, where: Where, label: string): ResolvedMoment {
  const notes: string[] = [];
  if (where.offset !== undefined && where.offset !== null) {
    if (!Number.isFinite(where.offset) || Math.abs(where.offset) > 15 * 60) throw new InputError("UTC offset is out of range.");
    return { utc: fromOffset(ymd, hms, where.offset), localLabel: label, offset: where.offset, source: "manual", notes };
  }

  let local = DateTime.fromObject({ ...ymd, ...hms }, { zone: where.tz });
  if (!local.isValid) throw new InputError(`Could not resolve that date in ${where.tz}.`);

  if (inLmtPeriod(where.tz, local)) {
    const offset = where.lon * 4;
    notes.push(`Before standard time, clocks ran on local mean time. We used the birthplace's own (${fmtOffset(offset)}).`);
    return { utc: fromOffset(ymd, hms, offset), localLabel: label, offset, source: "lmt", notes };
  }

  const hhmm = `${String(hms.hour).padStart(2, "0")}:${String(hms.minute).padStart(2, "0")}`;
  if (local.hour !== hms.hour || local.minute !== hms.minute) {
    notes.push(`Clocks jumped forward that night, so ${hhmm} never happened on the local clock. We used ${local.toFormat("HH:mm")} (${fmtOffset(local.offset)}).`);
  } else {
    const offsets = local.getPossibleOffsets().sort((a, b) => a.toMillis() - b.toMillis());
    if (offsets.length > 1) {
      local = offsets[0];
      notes.push(
        `Clocks fell back that night, so ${hhmm} happened twice. We used the first one (${fmtOffset(offsets[0].offset)}); the other was ${fmtOffset(offsets[1].offset)}. Set the UTC offset by hand if you know it was the second.`,
      );
    }
  }
  return { utc: local.toUTC(), localLabel: label, offset: local.offset, source: "tz", notes };
}

/** Local clock time at a place → UTC, using the offset in force on that date at that place. */
export function resolveMoment(date: string, time: string, where: Where): ResolvedMoment {
  const ymd = parseDate(date);
  const hms = parseTime(time);
  const label = DateTime.utc(ymd.year, ymd.month, ymd.day, hms.hour, hms.minute).toFormat("d LLL yyyy, HH:mm");
  return resolve(ymd, hms, where, label);
}

/** Start and end of the local calendar day, for unknown-time charts. */
export function resolveDay(date: string, where: Where) {
  const ymd = parseDate(date);
  const label = DateTime.utc(ymd.year, ymd.month, ymd.day).toFormat("d LLL yyyy");
  const start = resolve(ymd, { hour: 0, minute: 0, second: 0 }, where, label);
  const end = resolve(ymd, { hour: 23, minute: 59, second: 59 }, where, label);
  return { start, end };
}
