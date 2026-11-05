import "server-only";
import path from "node:path";
import sweph from "sweph";
import { DateTime } from "luxon";
import { ASPECT_BY_TYPE, stableAspects, findAspect, isEasy, separation, type Aspect, type Positions } from "./aspects";
import { STAR_ORB, STARS } from "./stars";
import { fmtOffset, InputError, resolveDay, resolveMoment } from "./time";
import { ALL_BODY_IDS, BODY_IDS, norm, signIndex, signOf, SLOW, type BodyId, type PointId } from "./zodiac";
import type { BirthInput, Chart, Contact, CoupleResult, PointRow, SkyResult, StarContact, Transit, WeekResult, WeekTransit, YearResult } from "./types";
import { weekTopic } from "./week-reading";
import { moonPhaseName, type BirthMoonResult, type BirthMoonSample } from "./moon-phase";
import { houseOf } from "./house-overlays";
import type { BirthTimeResult, BirthTimeSegment } from "./birth-time";
import type { Lunation, RetrogradePeriod } from "./sky-events";

const C = sweph.constants;
sweph.set_ephe_path(path.join(process.cwd(), "ephe"));

const FLAGS = C.SEFLG_SWIEPH | C.SEFLG_SPEED;
const SE_ID: Record<BodyId, number> = {
  sun: C.SE_SUN, moon: C.SE_MOON, mercury: C.SE_MERCURY, venus: C.SE_VENUS, mars: C.SE_MARS,
  jupiter: C.SE_JUPITER, saturn: C.SE_SATURN, uranus: C.SE_URANUS, neptune: C.SE_NEPTUNE, pluto: C.SE_PLUTO,
  node: C.SE_TRUE_NODE, chiron: C.SE_CHIRON,
};
const EXTRA = new Set<PointId>(["node", "chiron"]);
// Placidus is undefined where some degrees of the ecliptic never rise.
const POLAR_LAT = 66;

function jdOf(dt: DateTime) {
  const u = dt.toUTC();
  const r = sweph.utc_to_jd(u.year, u.month, u.day, u.hour, u.minute, u.second + u.millisecond / 1000, C.SE_GREG_CAL);
  if (r.flag !== C.OK) throw new Error(r.error);
  return r.data[1]; // UT1
}

function body(jd: number, id: BodyId) {
  const r = sweph.calc_ut(jd, SE_ID[id], FLAGS);
  if (r.error && !(r.flag & C.SEFLG_SWIEPH)) throw new Error(r.error);
  return { lon: r.data[0], speed: r.data[3] };
}

function bodies(jd: number): Positions {
  const out: Positions = {};
  for (const id of BODY_IDS) out[id] = body(jd, id).lon;
  return out;
}

function starLongitudes(jd: number) {
  return STARS.map((st) => {
    const r = sweph.fixstar2_ut(st.name, jd, C.SEFLG_SWIEPH);
    if (r.error && !r.data) throw new Error(r.error);
    return { star: st.name, lon: r.data[0] };
  });
}

/** Conjunctions to fixed stars that hold in every sample (one sample when the time is known). */
function starContacts(jd: number, samples: Positions[]): StarContact[] {
  const out: StarContact[] = [];
  for (const { star, lon } of starLongitudes(jd)) {
    for (const id of Object.keys(samples[0]) as PointId[]) {
      const orbs = samples.map((s) => separation(s[id]!, lon));
      if (orbs.every((o) => o <= STAR_ORB)) out.push({ star, point: id, lon, orb: Math.max(...orbs) });
    }
  }
  return out.sort((a, b) => a.orb - b.orb);
}

function cuspsFor(jd: number, lat: number, lon: number, sys: "P" | "O") {
  const r = sweph.houses(jd, lat, lon, sys);
  return { cusps: Array.from(r.data.houses), asc: r.data.points[0], mc: r.data.points[1] };
}

/** Bisection for the moment a body changes sign between jdA and jdB. */
function ingress(id: BodyId, jdA: number, jdB: number) {
  const target = signIndex(body(jdA, id).lon);
  let lo = jdA, hi = jdB;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (signIndex(body(mid, id).lon) === target) lo = mid;
    else hi = mid;
  }
  return hi;
}

const jdToDateTime = (jd: number) => {
  const r = sweph.jdut1_to_utc(jd, C.SE_GREG_CAL);
  return DateTime.fromObject(
    { year: r.year, month: r.month, day: r.day, hour: r.hour, minute: r.minute, second: Math.floor(r.second) },
    { zone: "utc" },
  );
};

interface Natal {
  chart: Chart;
  /** One sample when time is known, start/end of day when it is not. */
  samples: Positions[];
}

function natal(input: BirthInput): Natal {
  const { lat, lon, tz } = input.place;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) throw new Error("Bad coordinates.");

  if (input.time) {
    const m = resolveMoment(input.date, input.time, { tz, lon, offset: input.offset });
    const jd = jdOf(m.utc);
    const notes = [...m.notes];

    const porph = cuspsFor(jd, lat, lon, "O");
    const plac = Math.abs(lat) < POLAR_LAT ? cuspsFor(jd, lat, lon, "P") : null;
    if (!plac) notes.push("Placidus houses cannot be drawn this close to the pole, so only whole sign is shown.");
    const asc = porph.asc, mc = porph.mc;
    const ascSign = signIndex(asc);
    const whole = Array.from({ length: 12 }, (_, i) => ((ascSign + i) % 12) * 30);

    const rowFor = (id: PointId, lonV: number, speed: number): PointRow => ({
      id, lon: lonV, speed, retro: speed < 0,
      houses: {
        placidus: plac ? houseOf(lonV, plac.cusps) : null,
        whole: houseOf(lonV, whole),
        porphyry: houseOf(lonV, porph.cusps),
      },
    });

    const points: PointRow[] = ALL_BODY_IDS.map((id) => {
      const b = body(jd, id);
      return rowFor(id, b.lon, b.speed);
    });
    points.push(rowFor("asc", asc, 0), rowFor("mc", mc, 0));

    // Aspects use planets and angles only.
    const pos: Positions = Object.fromEntries(points.filter((p) => !EXTRA.has(p.id)).map((p) => [p.id, p.lon]));
    return {
      samples: [pos],
      chart: {
        input,
        timeKnown: true,
        moment: { localLabel: m.localLabel, utc: m.utc.toISO()!, offset: fmtOffset(m.offset), offsetSource: m.source },
        notes,
        points,
        cusps: { placidus: plac?.cusps ?? null, whole, porphyry: porph.cusps },
        aspects: stableAspects([[pos, pos]], { sameChart: true }),
        stars: starContacts(jd, [pos]),
      },
    };
  }

  const { start, end } = resolveDay(input.date, { tz, lon, offset: input.offset });
  const jdA = jdOf(start.utc), jdB = jdOf(end.utc);
  // Ingress times are shown on the birthplace clock, using the same offset as the day.
  const toLocal = (jd: number) => jdToDateTime(jd).plus({ milliseconds: Math.round(start.offset * 60_000) }).toFormat("h:mm a");
  const points: PointRow[] = ALL_BODY_IDS.map((id) => {
    const a = body(jdA, id), b = body(jdB, id);
    const range: PointRow["range"] = { start: a.lon, end: b.lon };
    if (signIndex(a.lon) !== signIndex(b.lon)) {
      range.ingressLocal = toLocal(ingress(id, jdA, jdB));
    }
    return { id, lon: a.lon, speed: a.speed, retro: a.speed < 0, range };
  });
  const sA = bodies(jdA), sB = bodies(jdB);
  return {
    samples: [sA, sB],
    chart: {
      input,
      timeKnown: false,
      moment: { localLabel: start.localLabel + ", time unknown", utc: start.utc.toISO()!, offset: fmtOffset(start.offset), offsetSource: start.source },
      notes: start.source === "lmt" ? start.notes : [],
      points,
      aspects: stableAspects([[sA, sA], [sB, sB]], { sameChart: true }),
      stars: starContacts(jdA, [sA, sB]),
    },
  };
}

export function computeChart(input: BirthInput): Chart {
  return natal(input).chart;
}

export function computeBirthMoon(input: BirthInput): BirthMoonResult {
  const where = { tz: input.place.tz, lon: input.place.lon, offset: input.offset };
  const moments = input.time ? (() => { const at = resolveMoment(input.date, input.time, where); return { start: at, end: at }; })() : resolveDay(input.date, where);
  const times = [moments.start.utc];
  if (!input.time) {
    for (let at = moments.start.utc.plus({ hours: 1 }); at < moments.end.utc; at = at.plus({ hours: 1 })) times.push(at);
    times.push(moments.end.utc);
  }
  const samples: BirthMoonSample[] = times.map((at) => {
    const jd = jdOf(at);
    const elongation = norm(body(jd, "moon").lon - body(jd, "sun").lon);
    const phenomena = sweph.pheno_ut(jd, C.SE_MOON, FLAGS);
    if (phenomena.flag < 0) throw new Error(phenomena.error || "Could not calculate lunar illumination.");
    return { at: at.toISO()!, elongation, illumination: phenomena.data[1] * 100, waxing: elongation < 180, phase: moonPhaseName(elongation) };
  });
  return { timeKnown: Boolean(input.time), phases: [...new Set(samples.map((s) => s.phase))], samples,
    minIllumination: Math.min(...samples.map((s) => s.illumination)), maxIllumination: Math.max(...samples.map((s) => s.illumination)),
    localLabel: moments.start.localLabel, notes: [...new Set([...moments.start.notes, ...moments.end.notes])] };
}

export function computeCouple(a: BirthInput, b: BirthInput): CoupleResult {
  const na = natal(a), nb = natal(b);
  const samples: [Positions, Positions][] = [];
  for (const sa of na.samples) for (const sb of nb.samples) samples.push([withoutMc(sa), withoutMc(sb)]);
  // Rank personal contacts first: a slow planet is shared by everyone born that year.
  const weight = (asp: Aspect) => asp.orb + (SLOW.has(asp.a) ? 2 : 0) + (SLOW.has(asp.b) ? 2 : 0);
  const allContacts: Contact[] = stableAspects(samples, { skipSlowPairs: true, orbScale: 0.75 })
    .sort((x, y) => weight(x) - weight(y))
    .map((asp) => ({ ...asp, easy: isEasy(asp) }));
  return { a: na.chart, b: nb.chart, contacts: allContacts.slice(0, 3), allContacts };
}

const withoutMc = (p: Positions): Positions => Object.fromEntries(Object.entries(p).filter(([k]) => k !== "mc"));

// --- The year: dated transits of slow planets to the natal chart ---

const TRANSITING: BodyId[] = ["jupiter", "saturn", "uranus", "neptune", "pluto"];
const TRANSIT_ORB = 1;
const PLANET_W: Partial<Record<BodyId, number>> = { pluto: 5, neptune: 4, uranus: 4.5, saturn: 4.5, jupiter: 3 };
const TARGET_W: Partial<Record<PointId, number>> = {
  sun: 3, moon: 3, asc: 3, mc: 2.2, venus: 2, mars: 2, mercury: 1.6, saturn: 1.4, jupiter: 1,
};
const ASPECT_W = { conjunction: 3, opposition: 2.5, square: 2.5, trine: 1.5, sextile: 1 };

export function computeYear(input: BirthInput, today: DateTime = DateTime.utc().startOf("day")): YearResult {
  const n = natal(input);
  const targets = Object.keys(TARGET_W) as PointId[];
  // A day-wide range is useless for the Moon (13°) and the angles (360°).
  const skipped: PointId[] = n.chart.timeKnown ? [] : ["moon", "asc", "mc"];
  const natalPos = n.samples[0];
  const use = targets.filter((t) => !skipped.includes(t) && natalPos[t] !== undefined);
  const natalAt = (t: PointId) =>
    n.chart.timeKnown ? natalPos[t]! : (n.samples[0][t]! + separationSigned(n.samples[0][t]!, n.samples[1][t]!) / 2);

  // Scan a wide window so passes that start before today or run past next year get their real dates.
  const from = today.minus({ days: 500 }), to = today.plus({ days: 900 });
  const days = Math.round(to.diff(from, "days").days);
  const jd0 = jdOf(from.set({ hour: 12 }));

  type Hit = { day: number; orb: number };
  const runs = new Map<string, Hit[]>();
  for (let d = 0; d <= days; d++) {
    const jd = jd0 + d;
    for (const p of TRANSITING) {
      const lonP = body(jd, p).lon;
      for (const t of use) {
        const hit = findAspect(lonP, natalAt(t));
        if (!hit || hit.orb > TRANSIT_ORB) continue;
        const key = `${p}|${t}|${hit.type}`;
        if (!runs.has(key)) runs.set(key, []);
        runs.get(key)!.push({ day: d, orb: hit.orb });
      }
    }
  }

  const todayIdx = 500, endIdx = 500 + 365;
  const candidates: (Transit & { score: number })[] = [];
  for (const [key, hits] of runs) {
    const [planet, target, type] = key.split("|") as [BodyId, PointId, Transit["type"]];
    // Split into passes, then join passes separated by a retrograde loop (< 200 days).
    const passes: Hit[][] = [];
    for (const h of hits) {
      const last = passes.at(-1);
      if (last && h.day - last.at(-1)!.day <= 1) last.push(h);
      else passes.push([h]);
    }
    const groups: Hit[][][] = [];
    for (const pass of passes) {
      const g = groups.at(-1);
      if (g && pass[0].day - g.at(-1)!.at(-1)!.day < 200) g.push(pass);
      else groups.push([pass]);
    }
    for (const g of groups) {
      const s = g[0][0].day, e = g.at(-1)!.at(-1)!.day;
      if (e < todayIdx || s > endIdx) continue;
      // Ignore a group whose only contact is at the very edge of the scan.
      if (s === 0 || e === days) continue;
      const exact = g.map((pass) => pass.reduce((m, h) => (h.orb < m.orb ? h : m)).day);
      const iso = (d: number) => from.plus({ days: d }).toISODate()!;
      const overlap = Math.min(e, endIdx) - Math.max(s, todayIdx);
      candidates.push({
        planet, target, type,
        start: iso(s), end: iso(e), exact: exact.map(iso),
        score: PLANET_W[planet]! * TARGET_W[target]! * ASPECT_W[type] * (0.6 + 0.4 * Math.min(1, overlap / 60)),
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const picked: Transit[] = [];
  const perPlanet = new Map<BodyId, number>();
  for (const c of candidates) {
    if (picked.length === 6) break;
    const k = perPlanet.get(c.planet) ?? 0;
    if (k >= 2) continue;
    perPlanet.set(c.planet, k + 1);
    picked.push(stripScore(c));
  }
  // Fill if the diversity rule left gaps.
  for (const c of candidates) {
    if (picked.length === 6) break;
    if (!picked.some((p) => p.planet === c.planet && p.target === c.target && p.type === c.type && p.start === c.start)) {
      picked.push(stripScore(c));
    }
  }
  picked.sort((a, b) => a.start.localeCompare(b.start));
  return { from: today.toISODate()!, to: today.plus({ days: 365 }).toISODate()!, transits: picked, skippedTargets: skipped };
}

const stripScore = ({ planet, target, type, start, end, exact }: Transit): Transit => ({ planet, target, type, start, end, exact });

function separationSigned(a: number, b: number) {
  let d = norm(b - a);
  if (d > 180) d -= 360;
  return d;
}

/** Seven UTC calendar days, sampled every six hours. Times are explicitly sample times, not exact passes. */
export function computeWeek(input: BirthInput, now: DateTime = DateTime.utc()): WeekResult {
  const n = natal(input);
  const from = now.toUTC().startOf("day");
  const skipped: PointId[] = n.chart.timeKnown ? [] : ["moon", "asc", "mc"];
  const targets: PointId[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "asc", "mc"];
  const moving: BodyId[] = ["sun", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
  const candidates = new Map<string, WeekTransit>();
  for (let hour = 0; hour < 7 * 24; hour += 6) {
    const at = from.plus({ hours: hour });
    const jd = jdOf(at);
    for (const planet of moving) {
      const transitLon = body(jd, planet).lon;
      for (const target of targets) {
        if (skipped.includes(target)) continue;
        const natalLongitudes = n.samples.map((sample) => sample[target]).filter((value): value is number => value !== undefined);
        if (natalLongitudes.length !== n.samples.length) continue;
        const first = findAspect(transitLon, natalLongitudes[0]);
        if (!first) continue;
        const angle = ASPECT_BY_TYPE[first.type].angle;
        const orbs = natalLongitudes.map((lon) => Math.abs(separation(transitLon, lon) - angle));
        const maxOrb = Math.max(...orbs);
        if (maxOrb > 1) continue;
        // Report measured natal samples only; do not infer an exact pass between them.
        const minOrb = Math.min(...orbs);
        const key = `${planet}-${target}-${first.type}`;
        const existing = candidates.get(key);
        const date = at.toISODate()!;
        if (!existing) candidates.set(key, { planet, target, type: first.type, activeDates: [date], closestAt: at.toISO()!, transitLon, natalLongitudes, minOrb, maxOrb });
        else {
          if (!existing.activeDates.includes(date)) existing.activeDates.push(date);
          if (maxOrb < existing.maxOrb) Object.assign(existing, { closestAt: at.toISO()!, transitLon, natalLongitudes, minOrb, maxOrb });
        }
      }
    }
  }
  // An editorial selection, not a measure of importance or predicted life impact.
  const ranked = [...candidates.values()].sort((a, b) => a.maxOrb - b.maxOrb || a.closestAt.localeCompare(b.closestAt) || `${a.planet}-${a.target}-${a.type}`.localeCompare(`${b.planet}-${b.target}-${b.type}`));
  const picked: WeekTransit[] = [];
  for (const transit of ranked) {
    if (picked.length === 3) break;
    if (!picked.some((other) => weekTopic(other.target) === weekTopic(transit.target))) picked.push(transit);
  }
  for (const transit of ranked) {
    if (picked.length === 3) break;
    if (!picked.includes(transit)) picked.push(transit);
  }
  return { from: from.toISODate()!, to: from.plus({ days: 6 }).toISODate()!, calculatedAt: now.toUTC().toISO()!, timeZone: "UTC", sampleHours: 6, orbLimit: 1, timeKnown: n.chart.timeKnown, transits: picked, qualifyingContacts: candidates.size, skippedTargets: skipped };
}

// --- The sky right now ---

// Exact phases get a ±10° window; the rest is crescent or gibbous.
const PHASES: [number, string][] = [
  [10, "New Moon"], [80, "Waxing crescent"], [100, "First quarter"], [170, "Waxing gibbous"],
  [190, "Full Moon"], [260, "Waning gibbous"], [280, "Last quarter"], [350, "Waning crescent"], [360, "New Moon"],
];

export function computeSky(now: DateTime = DateTime.utc()): SkyResult {
  const jd = jdOf(now);
  const points: PointRow[] = ALL_BODY_IDS.map((id) => {
    const b = body(jd, id);
    return { id, lon: b.lon, speed: b.speed, retro: b.speed < 0 && id !== "node" };
  });
  const pos: Positions = Object.fromEntries(points.filter((p) => BODY_IDS.includes(p.id as never)).map((p) => [p.id, p.lon]));
  const elong = norm(pos.moon! - pos.sun!);
  const phase = PHASES.find(([max]) => elong < max)![1];
  const illumination = Math.round(((1 - Math.cos((elong * Math.PI) / 180)) / 2) * 100);

  // When the Moon next changes sign, to the minute.
  let step = jd;
  const moonSign = signIndex(pos.moon!);
  while (signIndex(body(step, "moon").lon) === moonSign) step += 0.25;
  const moonIngress = jdToDateTime(ingress("moon", step - 0.25, step)).toISO()!;

  return {
    at: now.toISO()!,
    chart: {
      input: { date: now.toISODate()!, time: null, place: { label: "Geocentric", lat: 0, lon: 0, tz: "UTC" } },
      timeKnown: false,
      moment: { localLabel: now.toFormat("d LLL yyyy, HH:mm 'UTC'"), utc: now.toISO()!, offset: "UTC+0:00", offsetSource: "tz" },
      notes: [],
      points,
      aspects: stableAspects([[pos, pos]], { sameChart: true, orbScale: 0.5 }),
      stars: [],
    },
    moon: { phase, illumination, waxing: elong < 180, ingress: moonIngress },
  };
}

// --- Birth Time Explorer: what changes across an uncertain birth time ---

const SCAN_STEP = 2 / 1440; // Two minutes: shorter than any sign's passage outside the polar circles.

/** Every Rising sign possible between two local clock times on one birth date. */
export function computeBirthTimeRange(input: BirthInput, from: string, to: string): BirthTimeResult {
  const { lat, lon, tz } = input.place;
  const where = { tz, lon, offset: input.offset };
  const a = resolveMoment(input.date, from, where), b = resolveMoment(input.date, to, where);
  if (b.utc <= a.utc) throw new InputError("The latest time must be after the earliest time.");
  const jdA = jdOf(a.utc), jdB = jdOf(b.utc);
  const ascAt = (jd: number) => cuspsFor(jd, lat, lon, "O").asc;
  const local = (jd: number) => {
    const utc = jdToDateTime(jd).plus({ seconds: 30 }); // Nearest minute, so durations add up.
    return (a.source === "tz" ? utc.setZone(tz) : utc.plus({ milliseconds: Math.round(a.offset * 60_000) })).toFormat("HH:mm");
  };

  const edges = [jdA];
  let prev = jdA;
  while (prev < jdB) {
    const next = Math.min(prev + SCAN_STEP, jdB);
    if (signIndex(ascAt(prev)) !== signIndex(ascAt(next))) {
      const sign = signIndex(ascAt(prev));
      let lo = prev, hi = next;
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        if (signIndex(ascAt(mid)) === sign) lo = mid;
        else hi = mid;
      }
      edges.push(hi);
    }
    prev = next;
  }
  edges.push(jdB);

  const segments: BirthTimeSegment[] = edges.slice(0, -1).map((start, i) => {
    const end = edges[i + 1];
    const mid = (start + end) / 2;
    const ascSign = signIndex(ascAt(mid));
    const wholeHouse = (id: BodyId) => ((signIndex(body(mid, id).lon) - ascSign + 12) % 12) + 1;
    return {
      rising: signOf(ascAt(mid)),
      from: i === 0 ? from.slice(0, 5) : local(start),
      to: i === edges.length - 2 ? to.slice(0, 5) : local(end),
      minutes: Math.round((end - start) * 1440),
      ascFrom: ascAt(start),
      ascTo: ascAt(end - 1 / 86_400),
      sunHouse: wholeHouse("sun"),
      moonHouse: wholeHouse("moon"),
    };
  });

  const signsAcross = (id: BodyId) => [...new Set([signOf(body(jdA, id).lon), signOf(body(jdB, id).lon)])];
  const moonSigns = signsAcross("moon");
  return {
    from: from.slice(0, 5), to: to.slice(0, 5),
    totalMinutes: Math.round((jdB - jdA) * 1440),
    segments, moonSigns, sunSigns: signsAcross("sun"),
    moonChangeAt: moonSigns.length > 1 ? local(ingress("moon", jdA, jdB)) : null,
    notes: [...new Set([...a.notes, ...b.notes])],
  };
}

// --- Dated sky events for the public calendars ---

const bisect = (lo: number, hi: number, sideOf: (jd: number) => boolean) => {
  const start = sideOf(lo);
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (sideOf(mid) === start) lo = mid;
    else hi = mid;
  }
  return hi;
};

/** Retrograde loops of a planet that begin between two UTC dates, from its geocentric stations. */
export function computeRetrogrades(planet: BodyId, from: DateTime, to: DateTime): RetrogradePeriod[] {
  const out: RetrogradePeriod[] = [];
  const end = jdOf(to);
  let jd = jdOf(from);
  let retro = body(jd, planet).speed < 0;
  let start: number | null = null;
  for (; jd < end + 60; jd += 1) {
    const now = body(jd + 1, planet).speed < 0;
    if (now === retro) continue;
    const station = bisect(jd, jd + 1, (t) => body(t, planet).speed < 0);
    if (now && station < end) start = station;
    else if (!now && start !== null) {
      out.push({ start: jdToDateTime(start).toISO()!, end: jdToDateTime(station).toISO()!, startLon: body(start, planet).lon, endLon: body(station, planet).lon });
      start = null;
    }
    retro = now;
  }
  return out;
}

/** New and full Moons between two UTC dates, by the Sun-Moon longitude angle. */
export function computeLunations(from: DateTime, to: DateTime): Lunation[] {
  const elongation = (jd: number) => norm(body(jd, "moon").lon - body(jd, "sun").lon);
  const out: Lunation[] = [];
  const end = jdOf(to), step = 0.25;
  for (let jd = jdOf(from); jd < end; jd += step) {
    const x = elongation(jd), y = elongation(jd + step);
    const isNew = x > y; // The angle wraps from 360 back to 0.
    const isFull = x < 180 && y >= 180;
    if (!isNew && !isFull) continue;
    const at = isNew
      ? bisect(jd, jd + step, (t) => elongation(t) > 180)
      : bisect(jd, jd + step, (t) => elongation(t) >= 180);
    out.push({ type: isNew ? "new" : "full", at: jdToDateTime(at).toISO()!, lon: body(at, "moon").lon });
  }
  return out;
}
