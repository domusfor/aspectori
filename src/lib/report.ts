import type { Chart, CoupleResult, HouseSystem, YearResult } from "./astro/types";
import { buildReading, positionLabel, signsOf } from "./astro/reading";
import { aspectOrbLabel, aspectSentence, aspectTitle, transitSentence } from "./astro/library";
import { ASPECT_BY_TYPE } from "./astro/aspects";
import { POINT_NAMES } from "./astro/zodiac";
import { encodeBirth, fmtDate } from "./url";
import { contactReading, type Relationship } from "./comparison-reading";
import { REFLECTIONS, REPORT_GLOSSARY } from "./chart-insights";
import { comparisonOverlays, OVERLAY_METHOD } from "./astro/house-overlays";

export const REPORT_OFFER = { price: 0, currency: "USD", label: "Free PDF report" } as const;

export function reportHref(chart: Chart, system: HouseSystem = "placidus") {
  return `/report#${new URLSearchParams({ b: encodeBirth(chart.input), hs: system })}`;
}

export interface ReportSection { title: string; paragraphs: string[] }
export interface ReportComparison { result: CoupleResult; name: string; relationship: Relationship }

/** One content model feeds the printable view and the downloadable document. */
export function buildReport(chart: Chart, year: YearResult | null, system: HouseSystem, comparison?: ReportComparison): { title: string; sections: ReportSection[] } {
  const selected = chart.cusps?.placidus ? system : "whole";
  const reading = buildReading(chart, selected);
  const title = chart.points.filter((point) => ["sun", "moon", "asc"].includes(point.id)).map((point) => `${signsOf(point).join(" or ")} ${POINT_NAMES[point.id]}`).join(", ");
  const sections: ReportSection[] = [
    { title: "Your birth details and calculation settings", paragraphs: [
      `${chart.moment.localLabel} · ${chart.input.place.label}`,
      `${chart.moment.offset} · Latitude ${chart.input.place.lat.toFixed(4)}, longitude ${chart.input.place.lon.toFixed(4)} · ${chart.input.place.tz}`,
      `Tropical zodiac · geocentric positions · Swiss Ephemeris. Reading uses ${selected === "whole" ? "whole sign" : "Placidus"} houses${chart.timeKnown ? "." : "; houses and Rising are omitted because birth time is unknown."}`,
      ...chart.notes,
      ...(!chart.timeKnown ? ["Planet positions below show the start and end of the local birth day. Different endpoint signs appear as two possibilities. Retained aspects hold at both endpoints; displayed ranges are not continuous bounds."] : []),
    ] },
    { title: "Planetary placements", paragraphs: chart.points.map((p) => `${POINT_NAMES[p.id]}: ${positionLabel(p).replace("℞", "retrograde")}${p.range?.ingressLocal ? `; changes sign at ${p.range.ingressLocal} local time` : ""}${p.houses ? ` · Placidus ${p.houses.placidus ?? "unavailable"} · Whole sign ${p.houses.whole}` : ""}`) },
    { title: "Your reading", paragraphs: [...reading.lead, ...reading.rest].flatMap((entry) => [entry.title, ...entry.lines, `Based on: ${entry.evidence.map((e) => `${e.label} ${e.position}${e.house ? `, ${e.house}` : ""}`).join("; ")}`]) },
    { title: "Questions to make the reading your own", paragraphs: chart.points.filter((p) => ["sun", "moon", "asc", "mercury", "venus", "mars"].includes(p.id)).map((p) => `${POINT_NAMES[p.id]}: ${REFLECTIONS[p.id]}`) },
    { title: "Major aspects and their orbs", paragraphs: chart.aspects.length ? chart.aspects.map((aspect) => `${aspectTitle(aspect)} · ${aspectOrbLabel(aspect, chart.timeKnown)}. ${aspectSentence(aspect)}`) : ["No qualifying major aspects were found within the configured orbs."] },
    { title: "The next twelve months", paragraphs: year ? [
      `Calculated window: ${fmtDate(year.from)} to ${fmtDate(year.to)}. These are selected transits, not a complete transit calendar or a prediction of events.`,
      ...year.transits.map((t) => `${fmtDate(t.start)} to ${fmtDate(t.end)}: ${POINT_NAMES[t.planet]} ${ASPECT_BY_TYPE[t.type].verb} your ${POINT_NAMES[t.target]}. ${transitSentence(t.planet, t.target, t.type)} Exact dates: ${t.exact.map((date) => fmtDate(date)).join(", ")}.`),
      ...(year.skippedTargets.length ? ["With an unknown birth time, transits to the Moon, Rising and Midheaven are omitted."] : []),
    ] : ["The year-ahead calculation was unavailable when this report was created. Your natal chart and reading are complete; retry the year calculation on the report page to include dated transits."] },
    ...(comparison ? [{ title: `Your connection with ${comparison.name}`, paragraphs: [
      "This is a symbolic comparison for reflection. It cannot measure love, friendship, consent or relationship success. Relationship type changes the questions, not the calculations.",
      `${comparison.name}: ${comparison.result.b.moment.localLabel} · ${comparison.result.b.input.place.label}. ${comparison.result.a.timeKnown && comparison.result.b.timeKnown ? "Both birth times were provided." : "A birth time is missing; uncertain angles are omitted and only contacts supported by both local-day endpoint samples are retained. This does not guarantee a contact at every intervening moment."}`,
      ...comparison.result.allContacts.flatMap((contact) => { const detail = contactReading(contact, comparison.relationship); return [`${detail.title} · ${aspectOrbLabel(contact, comparison.result.a.timeKnown && comparison.result.b.timeKnown)} orb`, detail.interpretation, detail.geometry, detail.prompt]; }),
    ] }] : []),
    ...(comparison ? comparisonOverlays(comparison.result, comparison.name).map((direction) => ({ title: direction.title, paragraphs: [OVERLAY_METHOD, ...direction.paragraphs] })) : []),
    { title: "A short guide to the language", paragraphs: REPORT_GLOSSARY.map(([term, definition]) => `${term}: ${definition}`) },
    { title: "How to use this report", paragraphs: [
      "Start with the Sun, Moon and Rising, then follow the evidence beneath each reading. A sign describes the symbolic style, a house describes an area of life, and an aspect connects two chart points. An orb is the distance from the exact aspect angle.",
      "Astrological interpretations are for reflection and entertainment. Precise astronomical positions do not establish the scientific validity of personality claims or predictions.",
      "Chart calculations are checked against a published reference set; historical time-zone exceptions are documented on the Accuracy page. Birth-time and source uncertainty still matter.",
      "The report is generated in your browser. Your birth details appear in this file and in the chart link: share either only with people you want to see them.",
    ] },
  ];
  return { title, sections };
}
