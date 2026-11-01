import type { Chart, HouseSystem, YearResult } from "./astro/types";
import { buildReport, type ReportComparison } from "./report";
import { buildReading, pointMap, positionLabel, signsOf } from "./astro/reading";
import { POINT_NAMES } from "./astro/zodiac";
import { aspectOrbLabel, aspectSentence, aspectTitle, transitSentence } from "./astro/library";
import { ASPECT_BY_TYPE } from "./astro/aspects";
import { elementBalance, REFLECTIONS, REPORT_GLOSSARY } from "./chart-insights";
import { contactReading, TOPICS } from "./comparison-reading";
import { comparisonOverlays, OVERLAY_METHOD } from "./astro/house-overlays";
import { fmtDate } from "./url";

const C = { navy: "#101d31", ink: "#253248", muted: "#5c6877", gold: "#927039", lightGold: "#e2c58d", paper: "#faf7f0", line: "#ddd7cb", panel: "#f0ebe0", white: "#ffffff" };

/** An editorial document with selectable text, embedded fonts and measured page breaks. */
export async function downloadReport(chart: Chart, year: YearResult | null, system: HouseSystem, wheel: HTMLElement | null, comparison?: ReportComparison) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true, putOnlyUsedFonts: true });
  const fonts = [
    ["NotoSans-Regular.ttf", "Body", "normal"],
    ["NotoSans-Bold.ttf", "Body", "bold"],
    ["NotoSerif-Regular.ttf", "Editorial", "normal"],
  ] as const;
  const files = await Promise.all(fonts.map(async ([file]) => {
    const response = await fetch(`/fonts/${file}`);
    if (!response.ok) throw new Error("The report fonts could not be loaded. Please try again.");
    const bytes = new Uint8Array(await response.arrayBuffer());
    let data = "";
    for (let i = 0; i < bytes.length; i += 8192) data += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return btoa(data);
  }));
  fonts.forEach(([file, name, style], i) => { doc.addFileToVFS(file, files[i]); doc.addFont(file, name, style); });
  doc.setProperties({ title: comparison ? `Aspectori — Your sky & ${comparison.name}` : "Aspectori — The shape of your sky", author: "Aspectori", subject: "Birth chart, interpretive reading and calculation evidence" });
  const selected = chart.cusps?.placidus ? system : "whole";
  const content = buildReport(chart, year, selected, comparison);
  const points = pointMap(chart);
  const balance = elementBalance(chart);
  let y = 70;
  let currentTitle = "";
  let currentSubtitle = "";
  const pageNames: string[] = ["Your personal sky"];
  doc.outline.add(null, comparison ? `You & ${comparison.name}` : "Your personal sky", { pageNumber: 1 });
  type TextStyle = { size?: number; width?: number; font?: "Body" | "Editorial"; bold?: boolean; color?: string; leading?: number };
  const clean = (value: string) => value.replaceAll("℞", "retrograde");
  const setFont = (style: TextStyle) => { doc.setFont(style.font ?? "Body", style.bold ? "bold" : "normal"); doc.setFontSize(style.size ?? 9.3); doc.setTextColor(style.color ?? C.ink); };
  const linesFor = (value: string, style: TextStyle) => { setFont(style); return doc.splitTextToSize(clean(value), style.width ?? 174) as string[]; };
  const height = (value: string, style: TextStyle = {}) => linesFor(value, style).length * (style.leading ?? (style.size ?? 9.3) * .48);
  const text = (value: string, x: number, at: number, style: TextStyle = {}) => {
    const lines = linesFor(value, style);
    const leading = style.leading ?? (style.size ?? 9.3) * .48;
    for (let i = 0; i < lines.length; i++) doc.text(lines[i], x, at + i * leading);
    return at + lines.length * leading;
  };
  const fill = (color: string) => doc.setFillColor(color);
  const rule = (at: number) => { doc.setDrawColor(C.line); doc.setLineWidth(.25); doc.line(18, at, 192, at); };
  const start = (title: string, subtitle: string, continued = false) => {
    doc.addPage(); fill(C.paper); doc.rect(0, 0, 210, 297, "F");
    currentTitle = title; currentSubtitle = subtitle; pageNames.push(title);
    if (!continued) doc.outline.add(null, title, { pageNumber: doc.getNumberOfPages() });
    text("A S P E C T O R I", 18, 15, { size: 7, color: C.gold });
    text(continued ? "YOUR PERSONAL ATLAS / CONTINUED" : "YOUR PERSONAL ATLAS", 126, 15, { size: 6.4, width: 66, color: C.muted });
    rule(21);
    const bottom = text(title, 18, 38, { size: 25, font: "Editorial", width: 174 });
    y = text(subtitle, 18, bottom + 2, { size: 9, width: 169, color: C.muted }) + 9;
  };
  const ensure = (space: number) => { if (y + space > 269) start(currentTitle, currentSubtitle, true); };
  const paragraph = (value: string, style: TextStyle = {}) => { const h = height(value, style); ensure(h + 5); y = text(value, 18, y, style) + 5; };
  const card = (title: string, paragraphs: { text: string; color?: string; small?: boolean }[], label?: string) => {
    const titleStyle = { size: 15, font: "Editorial" as const, width: 154 };
    const bodyHeight = paragraphs.reduce((total, p) => total + height(p.text, { size: p.small ? 8 : 9.3, width: 154 }) + 3, 0);
    const h = 15 + height(title, titleStyle) + bodyHeight + (label ? 6 : 0);
    ensure(h + 5); fill(C.white); doc.setDrawColor(C.line); doc.roundedRect(18, y - 4, 174, h, 2, 2, "FD");
    let cy = y + 5;
    if (label) cy = text(label.toUpperCase(), 27, cy, { size: 6.8, bold: true, color: C.gold, width: 154 }) + 3;
    cy = text(title, 27, cy, titleStyle) + 4;
    for (const p of paragraphs) cy = text(p.text, 27, cy, { size: p.small ? 8 : 9.3, width: 154, color: p.color ?? C.ink }) + 3;
    y += h + 5;
  };

  // Cover: vector decoration, embedded chart and a quiet typographic hierarchy.
  fill(C.navy); doc.rect(0, 0, 210, 297, "F");
  doc.setDrawColor("#2d4058"); doc.setLineWidth(.25); doc.circle(180, 39, 48); doc.circle(180, 39, 61);
  for (let i = 0; i < 20; i++) { fill(i % 3 ? "#627080" : C.lightGold); doc.circle(18 + (i * 47) % 174, 20 + (i * 31) % 237, i % 3 ? .25 : .5, "F"); }
  text("A S P E C T O R I", 18, 21, { size: 11, color: C.lightGold });
  text(comparison ? "YOUR SKIES,\nTOGETHER." : "THE SHAPE OF\nYOUR SKY.", 18, 44, { size: 34, leading: 15, font: "Editorial", color: C.paper, width: 174 });
  text(comparison ? `A connection atlas / You & ${comparison.name}` : "A personal birth chart & reflection atlas", 19, 78, { size: 10, color: C.lightGold });
  if (wheel) {
    await document.fonts.ready;
    const { toPng } = await import("html-to-image");
    const image = await toPng(wheel, { pixelRatio: 2.5, backgroundColor: "#f7f3ea", width: wheel.clientWidth, height: wheel.clientHeight, style: { margin: "0", transform: "none" } });
    fill("#f7f3ea"); doc.roundedRect(36, 91, 138, 138, 4, 4, "F");
    doc.addImage(image, "PNG", 39, 94, 132, 132);
  }
  text(content.title, 18, 244, { font: "Editorial", size: 15, color: C.paper, width: 174 });
  text(`${chart.moment.localLabel} · ${chart.input.place.label}`, 18, 264, { size: 8, color: "#d4d8df", width: 174 });
  text("FREE EDITION / CALCULATED WITH SWISS EPHEMERIS", 18, 286, { size: 6.8, color: C.lightGold });

  start("Your chart at a glance", "Start with the three anchors. Keep the uncertainty alongside the interpretation.");
  for (const [i, id] of (["sun", "moon", "asc"] as const).entries()) {
    const x = 18 + i * 59;
    fill(i === 1 ? "#e9e4ed" : i === 2 ? "#e4ebed" : "#f0e6d3"); doc.roundedRect(x, y - 3, 56, 48, 2, 2, "F");
    text(POINT_NAMES[id].toUpperCase(), x + 5, y + 5, { size: 7, bold: true, color: C.gold, width: 46 });
    text(points[id] ? signsOf(points[id]).join(" or ") : "Unknown", x + 5, y + 15, { font: "Editorial", size: 14, width: 46 });
    text(points[id] ? positionLabel(points[id]) : "A birth time is needed.", x + 5, y + 32, { size: 7, width: 46, color: C.muted });
  }
  y += 59;
  paragraph("The elements in your chart", { font: "Editorial", size: 17 });
  for (const element of balance.elements) {
    text(element.name, 18, y + 2, { size: 9, bold: true });
    text(element.theme, 48, y + 2, { size: 8, color: C.muted, width: 69 });
    fill(C.panel); doc.roundedRect(121, y - 1, 58, 4, 1, 1, "F");
    if (element.count) { fill(element.color); doc.roundedRect(121, y - 1, 58 * element.count / 10, 4, 1, 1, "F"); }
    text(`${element.count}`, 184, y + 2, { size: 8, bold: true }); y += 11;
  }
  paragraph(`Equal counts of the ten planets, Sun through Pluto. ${balance.counted} can be assigned to one element${balance.uncertain ? `; ${balance.uncertain} change signs during the day and are excluded` : ""}. These are placement counts, not personality percentages.`, { size: 8, color: C.muted });
  card("How to use your atlas", [
    { text: "01 / Locate your placements in the planetary atlas.\n02 / Read the interpretation alongside its calculation evidence.\n03 / Try a reflection question; keep what fits your actual experience.\n04 / Use aspects and dates as reference, not as a verdict." },
    { text: comparison ? `Your comparison with ${comparison.name} follows the year-ahead section.` : "The final pages explain the vocabulary, calculation settings and limits.", small: true, color: C.gold },
  ]);

  start("The planetary atlas", "Signs and degrees are the calculation. Houses show where the chosen convention places them.");
  const tableHeader = () => {
    fill(C.navy); doc.roundedRect(18, y - 4, 174, 11, 1, 1, "F");
    for (const [value, x] of [["POINT", 22], ["SIGN & DEGREE", 55], ["PLACIDUS", 143], ["WHOLE", 174]] as const) text(value, x, y + 2, { size: 6.5, bold: true, color: C.white, width: 30 });
    y += 14;
  };
  tableHeader();
  for (const [i, point] of chart.points.entries()) {
    const label = positionLabel(point);
    const h = Math.max(12, height(label, { size: 8.2, width: 83 }) + 7);
    if (y + h > 265) { start("The planetary atlas", "Your positions, continued.", true); tableHeader(); }
    fill(i % 2 ? C.paper : "#eee9df"); doc.rect(18, y - 4, 174, h, "F");
    text(POINT_NAMES[point.id], 22, y + 1, { size: 8.3, bold: true, width: 30 });
    text(label, 55, y + 1, { size: 8.2, width: 83 });
    const differs = point.houses?.placidus != null && point.houses.placidus !== point.houses.whole;
    text(point.houses?.placidus == null ? "—" : String(point.houses.placidus), 151, y + 1, { size: 9, color: differs ? C.gold : C.ink, width: 13 });
    text(point.houses ? String(point.houses.whole) : "—", 179, y + 1, { size: 9, color: differs ? C.gold : C.ink, width: 13 });
    y += h;
  }
  y += 5;
  paragraph(chart.timeKnown ? `Reading uses ${selected === "whole" ? "whole sign" : "Placidus"} houses. Gold house numbers mark a difference between the systems. A dash means the house cannot be calculated.` : "Time unknown: positions are day ranges. Rising and houses are omitted. A dash is missing information, not a zero.", { size: 8, color: C.muted });
  for (const point of chart.points.filter((p) => p.range?.ingressLocal)) paragraph(`${POINT_NAMES[point.id]} changes sign at ${point.range!.ingressLocal} local time.`, { size: 8, color: C.gold });

  start("The story behind the chart", "Astrological interpretations are lenses for reflection. The evidence beneath each one keeps the reading grounded in your inputs.");
  const reading = buildReading(chart, selected);
  for (const entry of [...reading.lead, ...reading.rest]) {
    const point = chart.points.find((p) => p.id === entry.ref);
    card(entry.title, [
      ...entry.lines.map((line) => ({ text: line })),
      { text: `CALCULATION / ${entry.evidence.map((e) => `${e.label}: ${e.position}${e.house ? ` · ${e.house}` : ""}`).join("; ")}`, small: true, color: C.muted },
      { text: `REFLECT / ${point ? REFLECTIONS[point.id] : "Where do these two themes cooperate in your experience, and where do they need more room?"}`, small: true, color: C.gold },
    ]);
  }

  start("The connections within", "Major aspects and their orbs. A smaller orb means closer geometry; it does not validate a personality claim.");
  for (const aspect of chart.aspects) {
    const sentence = aspectSentence(aspect);
    const h = height(sentence, { size: 8.5, width: 154 }) + 17;
    ensure(h); rule(y - 3);
    text(aspectTitle(aspect), 18, y + 3, { size: 11, font: "Editorial", width: 130 });
    text(aspectOrbLabel(aspect, chart.timeKnown), 155, y + 3, { size: 8, color: C.gold, width: 37 });
    text(sentence, 18, y + 11, { size: 8.5, width: 154, color: C.muted }); y += h;
  }
  if (!chart.aspects.length) paragraph("No major aspects meet the configured limits for this chart.");

  start("A year to reflect on", year ? `${fmtDate(year.from)} — ${fmtDate(year.to)}. Selected transits, not a complete calendar or a prediction of events.` : "The natal report is ready. The optional year calculation was unavailable.");
  if (year) {
    for (const [i, transit] of year.transits.entries()) card(`${POINT_NAMES[transit.planet]} ${ASPECT_BY_TYPE[transit.type].verb} your ${POINT_NAMES[transit.target]}`, [
      { text: `${fmtDate(transit.start)} — ${fmtDate(transit.end)}`, color: C.gold },
      { text: transitSentence(transit.planet, transit.target, transit.type) },
      { text: `Exact dates: ${transit.exact.map((date) => fmtDate(date)).join(" · ")}`, small: true, color: C.muted },
      { text: "REFLECT / What is already changing in this area of your life, and which response is within your control?", small: true, color: C.gold },
    ], `Window ${String(i + 1).padStart(2, "0")}`);
    paragraph("Some displayed windows begin before or finish after the selected year so the full transit period remains visible. Dates describe alignments; they do not establish when a life event will occur.", { size: 8, color: C.muted });
    if (year.skippedTargets.length) paragraph("With an unknown birth time, transits to the Moon, Rising and Midheaven are omitted.", { size: 8, color: C.gold });
  } else paragraph(content.sections.find((s) => s.title === "The next twelve months")!.paragraphs[0]);

  if (comparison) {
    const result = comparison.result;
    start(`You & ${comparison.name}`, "A connection atlas for conversation, with the calculation behind every contact.");
    paragraph(`${comparison.name}: ${result.b.moment.localLabel} · ${result.b.input.place.label}`, { size: 9, color: C.gold });
    paragraph(`Your data: ${result.a.moment.localLabel} · ${result.a.input.place.label}`, { size: 9, color: C.muted });
    paragraph("Chart contacts cannot measure love, friendship, consent or relationship success. Your lived experience and choices matter more than an interpretation.", { size: 9 });
    if (!result.a.timeKnown || !result.b.timeKnown) paragraph("A birth time is missing. We omit the unknown angles and retain contacts supported by both local-day endpoints. Displayed ranges describe those samples, not every intervening moment. Fewer contacts do not mean a weaker connection.", { size: 9, color: C.gold });
    if (comparison.relationship === "famous") paragraph("This famous-person comparison explores symbolic similarities. It is not evidence of a personal connection.", { size: 9, color: C.muted });
    for (const contact of result.allContacts) {
      const detail = contactReading(contact, comparison.relationship);
      card(detail.title, [
        { text: detail.interpretation }, { text: detail.geometry, small: true, color: C.muted },
        { text: `CALCULATION / ${detail.angle}° aspect · ${aspectOrbLabel(contact, result.a.timeKnown && result.b.timeKnown)} orb. Your ${positionLabel(pointMap(result.a)[contact.a])}; their ${positionLabel(pointMap(result.b)[contact.b])}.`, small: true, color: C.muted },
        { text: `TRY THIS QUESTION / ${detail.prompt}`, small: true, color: C.gold },
      ], TOPICS[detail.topic].label);
    }
    if (!result.allContacts.length) paragraph("No contacts meet our comparison rules. This does not establish anything about the quality of your relationship.");
    paragraph("Comparison method: 75% of natal major-aspect orbs; personal contacts prioritized. Slow-planet pairs, Midheaven, node and Chiron contacts are excluded from aspects. The following house overlays include all ten planets. This is not a composite chart.", { size: 8, color: C.muted });
    for (const section of comparisonOverlays(result, comparison.name)) {
      start(section.title, "House overlays / whole sign and Placidus");
      paragraph(OVERLAY_METHOD, { size: 9 });
      for (const value of section.paragraphs) paragraph(value, { size: 9 });
    }
  }

  start("Reading with confidence", "A short reference to the words, settings and limits used throughout your atlas.");
  for (const [term, definition] of REPORT_GLOSSARY) card(term, [{ text: definition }]);
  start("Your calculation record", "Keep this page with the report when comparing results or revisiting your birth details.");
  for (const value of content.sections[0].paragraphs) paragraph(value, { size: 9 });
  card("What the calculation can—and cannot—tell you", [
    { text: "Swiss Ephemeris calculates astronomical positions. Astrological meanings are interpretive conventions and are not scientifically validated personality assessments or predictions." },
    { text: "Our published reference set checks 22 charts against Astro-Databank. Historical time-zone exceptions are documented; this does not establish accuracy for every possible birth input. Approximate times should be explored as a range." },
    { text: "Your data is sent to the calculation server; the PDF is assembled in your browser. The file and chart link include birth details. Share them only with people you choose.", small: true, color: C.muted },
  ]);
  paragraph("Explore the method and sources", { font: "Editorial", size: 16 });
  for (const [label, url] of [["Aspectori / calculation method", `${window.location.origin}/method`], ["Aspectori / published accuracy reference", `${window.location.origin}/accuracy`], ["Astrodienst / chart structure", "https://www.astro.com/astrology/in_chart_e.htm"], ["Astrodienst / synastry", "https://www.astro.com/astrowiki/en/Synastry"]]) {
    ensure(10); setFont({ size: 8.5, color: C.gold }); doc.textWithLink(label, 18, y, { url }); y += 8;
  }
  const pages = doc.getNumberOfPages();
  for (let page = 2; page <= pages; page++) {
    doc.setPage(page); rule(280);
    text(`ASPECTORI / ${pageNames[page - 1]}`, 18, 286, { size: 6.5, color: C.muted, width: 140 });
    text(`${String(page).padStart(2, "0")} / ${pages}`, 179, 286, { size: 7, color: C.gold, width: 20 });
    text("For reflection and entertainment", 18, 291, { size: 6, color: C.muted });
  }
  doc.save(`aspectori-${comparison ? "connection" : "birth-chart"}-${chart.input.date}.pdf`);
}
