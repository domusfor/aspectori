/**
 * Builds src/data/people.json from four Wikidata query results (CC0 data) in data-src/:
 *   core.json (person, birth date, birthplace), names.json (English Wikipedia title, description),
 *   places.json (place label, coordinates, parent coordinates, country), occ.json (occupations).
 *   npx tsx scripts/import-famous.ts
 *
 * People: humans with 50+ Wikipedia language editions, born 1800 or later, with a birth date
 * known to the day and a birthplace with coordinates. Wikidata has no birth times, so these
 * charts are date-only (Rodden X). The curated charts in famous.ts, with sourced times, win.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { find as findTz } from "geo-tz";
import { DateTime } from "luxon";
import { FAMOUS } from "../src/data/famous";

type Binding = Record<string, { value: string } | undefined>;
const load = (f: string): Binding[] => JSON.parse(readFileSync(`data-src/${f}.json`, "utf8")).results.bindings;
const v = (b: Binding, k: string) => b[k]?.value;

const qid = (iri: string) => iri.split("/").pop()!;

// Occupation → category. Earlier categories win when someone has several.
const CATEGORY_OCCUPATIONS: [string, string[]][] = [
  ["Royalty", ["Q116", "Q2478141", "Q12097", "Q2304859"]],
  ["Politics", ["Q82955", "Q372436", "Q193391", "Q189290", "Q3242115", "Q47064", "Q185351", "Q1097498", "Q30461"]],
  ["Sport", ["Q937857", "Q3665646", "Q10833314", "Q11513337", "Q11338576", "Q378622", "Q19204627", "Q12299841", "Q11774891", "Q10843402", "Q10873124", "Q10871364", "Q2309784", "Q11303721", "Q628099", "Q13381863", "Q13382576", "Q15117302", "Q13141064", "Q13474373", "Q17486376", "Q12840545", "Q14089670", "Q4144610", "Q2066131", "Q18515558"]],
  ["Music", ["Q177220", "Q639669", "Q36834", "Q2252262", "Q753110", "Q855091", "Q486748", "Q158852", "Q488205", "Q55960555", "Q183945", "Q8178443", "Q130857", "Q1259917", "Q806349"]],
  ["Film", ["Q33999", "Q10800557", "Q10798782", "Q2526255", "Q28389", "Q4610556", "Q245068", "Q3282637", "Q2405480", "Q2259451", "Q3455803", "Q578109", "Q69423232", "Q947873", "Q1053574"]],
  ["Business", ["Q43845", "Q131524", "Q806798", "Q484876", "Q557880"]],
  ["Science", ["Q169470", "Q593644", "Q170790", "Q864503", "Q39631", "Q11063", "Q81096", "Q205375", "Q82594", "Q212980", "Q901", "Q2374149", "Q1622272", "Q520549", "Q350979", "Q11900058", "Q3055126"]],
  ["Art", ["Q1028181", "Q1281618", "Q42973", "Q33231", "Q15296811", "Q483501", "Q1925963", "Q266569"]],
  ["Writing", ["Q36180", "Q6625963", "Q49757", "Q1930187", "Q214917", "Q18814623", "Q333634", "Q11774202", "Q482980", "Q4263842", "Q12144794", "Q18844224", "Q4853732"]],
  ["Thought", ["Q4964182", "Q188094", "Q201788", "Q2306091", "Q250867", "Q1234713", "Q37226", "Q212980", "Q1662561"]],
];
const OCC_RANK = new Map<string, [number, string]>();
CATEGORY_OCCUPATIONS.forEach(([cat, ids], rank) => ids.forEach((id) => { if (!OCC_RANK.has(id)) OCC_RANK.set(id, [rank, cat]); }));

const occsByPerson = new Map<string, string[]>();
for (const r of load("occ")) {
  const p = qid(v(r, "p")!);
  occsByPerson.set(p, [...(occsByPerson.get(p) ?? []), qid(v(r, "occ")!)]);
}
// Where the occupation list misleads (Wikidata lists many occupations for public figures).
// Reviewed by hand against the description text; the role-word rules below cannot read these.
const CATEGORY_OVERRIDE: Record<string, string> = {
  Q317521: "Business", // Elon Musk
  Q36215: "Business", // Mark Zuckerberg
  Q5816: "Politics", Q36014: "Politics", Q1317: "Politics", Q317219: "Politics", Q44220: "Politics", // Mao, Ho Chi Minh, bin Laden, Baradar, Breivik
  Q182921: "Royalty", Q203768: "Royalty", Q153099: "Royalty", // Reza Shah, Abdülmecid II, Sophie of Hohenberg
  Q37103: "Science", Q312961: "Science", Q212446: "Science", Q40224: "Science", Q167573: "Science", Q220520: "Science", Q181995: "Science", // Nightingale, Enders, Sikorsky, Benz, Kalashnikov, Browning, Sax
  Q101054: "Thought", Q104273: "Thought", Q312549: "Thought", Q234898: "Thought", Q26168: "Thought", Q84177: "Thought", Q159726: "Thought", Q311669: "Thought", Q235069: "Thought", Q313456: "Thought", Q207359: "Thought", // religious founders and thinkers
  Q82984: "Sport", Q78489: "Sport", Q172775: "Sport", Q40615: "Sport", Q80306: "Sport", Q152871: "Sport", Q44340: "Sport", // Coubertin and racing or football careers
  Q190251: "Music", Q294531: "Music", Q230445: "Music", Q214813: "Music", Q60970: "Music", Q487473: "Music", Q204218: "Music", // musicians described as recording artists or founders
  Q6105: "Film", Q515161: "Film", Q295855: "Film", // Hebe Camargo, Kevin Feige, Carlos Saura
  Q60039: "Politics", Q75849: "Politics", Q60045: "Politics", Q21089561: "Politics", Q217154: "Politics", Q152850: "Politics", // political careers listed as "architect"
  Q154759: "Science", Q116774: "Writing",
};
// The description names the primary role first ("American inventor and businessman"), so the
// earliest role word wins. Occupations are the fallback.
const ROLE_WORDS: [string, RegExp][] = [
  ["Royalty", /\b(king|queen|prince|princess|emperor|empress|monarch|duke|duchess|sultan|tsar|czar|royal)\b/i],
  ["Politics", /\b(politician|president|prime minister|chancellor|statesman|stateswoman|dictator|revolutionary|diplomat|senator|governor|general|military|activist|lawyer|judge|first lady)\b/i],
  ["Sport", /\b(martial artist|mixed martial|footballer|player|athlete|tennis|boxer|racing driver|cyclist|swimmer|chess|golfer|skater|gymnast|wrestler|sprinter|runner|coach|cricketer|jockey|skier|fighter|mountaineer|olympi\w*)\b/i],
  ["Music", /\b(singer|musician|composer|rapper|songwriter|guitarist|pianist|conductor|band|dj|drummer|violinist|cellist|vocalist)\b/i],
  ["Film", /\b(game designer|actor|actress|film|director|filmmaker|comedian|model|television|presenter|screenwriter|animator|youtuber)\b/i],
  ["Business", /\b(businessman|businesswoman|businessperson|entrepreneur|investor|industrialist|executive|founder of (?:the )?[A-Z][\w ]*(?:Group|Inc|Corporation)|founder of Panasonic|co-founder of (?:Microsoft|Intel|Twitter|Wikipedia)|magnate|banker|financier)\b/i],
  ["Science", /\b(physicist|chemist|mathematician|biologist|scientist|engineer|inventor|astronomer|physician|psychologist|astronaut|cosmonaut|neurologist|geologist|naturalist|programmer)\b/i],
  ["Art", /\b(painter|sculptor|(?<!martial )(?<!recording )artist|architect|photographer|(?<!game )designer|illustrator|cartoonist)\b/i],
  ["Writing", /\b(writer|novelist|poet|author|journalist|playwright|essayist)\b/i],
  ["Thought", /\b(philosopher|theologian|economist|historian|sociologist|pope|priest|saint|religious)\b/i],
];
function categoryFromDescription(desc: string) {
  let best: [number, string] | undefined;
  for (const [cat, re] of ROLE_WORDS) {
    const m = re.exec(desc);
    if (m && (!best || m.index < best[0])) best = [m.index, cat];
  }
  return best?.[1];
}

const categoryOf = (p: string, desc = "") => {
  if (CATEGORY_OVERRIDE[p]) return CATEGORY_OVERRIDE[p];
  const fromDesc = categoryFromDescription(desc);
  if (fromDesc) return fromDesc;
  let best: [number, string] | undefined;
  for (const o of occsByPerson.get(p) ?? []) {
    const hit = OCC_RANK.get(o);
    if (hit && (!best || hit[0] < best[0])) best = hit;
  }
  return best?.[1] ?? "Thought";
};

const slugify = (s: string) =>
  s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Curated charts (with sourced times) replace their Wikidata twin: same birth date and surname.
const curatedKey = new Set(FAMOUS.map((f) => `${f.birth.date}|${f.name.split(/[ ,]/).filter(Boolean).pop()!.toLowerCase()}`));
const curatedSlugs = new Set(FAMOUS.map((f) => f.slug));

const zoneOk = (z: string) => DateTime.now().setZone(z).isValid;

const names = new Map<string, { title: string; desc: string }>();
for (const r of load("names")) names.set(qid(v(r, "p")!), { title: v(r, "title")!, desc: v(r, "desc") ?? "" });

interface PlaceInfo { label?: string; lat?: number; lon?: number; country?: string }
const places = new Map<string, PlaceInfo>();
for (const r of load("places")) {
  const id = qid(v(r, "place")!);
  const cur = places.get(id) ?? {};
  cur.label ??= v(r, "pn");
  cur.country ??= v(r, "country");
  if (cur.lat === undefined && v(r, "lat")) { cur.lat = Number(v(r, "lat")); cur.lon = Number(v(r, "lon")); }
  // Fall back to the parent area (a city district, a municipality) when the place itself has no coordinates.
  if (cur.lat === undefined && v(r, "plat")) { cur.lat = Number(v(r, "plat")); cur.lon = Number(v(r, "plon")); }
  places.set(id, cur);
}

const people = new Map<string, { date: string; links: number; place: string }>();
for (const r of load("core")) {
  const id = qid(v(r, "p")!);
  const date = v(r, "dob")!.slice(0, 10);
  if (Number(date.slice(0, 4)) < 1800 || date.startsWith("-")) continue;
  const place = qid(v(r, "place")!);
  const prev = people.get(id);
  // Several birth dates or places means Wikidata disagrees with itself; keep the first with coordinates.
  if (prev && (prev.date !== date)) { people.set(id, { ...prev, date: "conflict" }); continue; }
  if (!prev || places.get(prev.place)?.lat === undefined) people.set(id, { date, links: Number(v(r, "links")), place });
}

const out: unknown[] = [];
const slugs = new Set<string>(curatedSlugs);
const skipped: Record<string, number> = {};
const skip = (why: string) => { skipped[why] = (skipped[why] ?? 0) + 1; };
for (const [id, person] of [...people.entries()].sort((a, b) => b[1].links - a[1].links)) {
  if (person.date === "conflict") { skip("conflicting birth dates"); continue; }
  const nm = names.get(id);
  if (!nm) { skip("no English Wikipedia article"); continue; }
  // "Prince (musician)" → "Prince"
  const name = nm.title.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (/fictional|legendary/i.test(nm.desc)) { skip("not a real person"); continue; }
  const date = person.date;
  const surname = name.split(/[ ,]/).filter(Boolean).pop()!.toLowerCase();
  if (curatedKey.has(`${date}|${surname}`)) { skip("curated chart exists"); continue; }

  const pl = places.get(person.place);
  if (!pl || pl.lat === undefined || pl.lon === undefined) { skip("birthplace has no coordinates"); continue; }
  const tz = findTz(pl.lat, pl.lon).find(zoneOk);
  if (!tz) { skip("no time zone at birthplace"); continue; }

  let slug = slugify(name);
  if (!slug) { skip("empty slug"); continue; }
  if (slugs.has(slug)) slug = `${slug}-${date.slice(0, 4)}`;
  if (slugs.has(slug)) { skip("duplicate slug"); continue; }
  slugs.add(slug);

  const place = [pl.label, pl.country].filter((x, i, a): x is string => !!x && a.indexOf(x) === i).join(", ");
  out.push({
    q: id, s: slug, n: name, d: nm.desc, b: date, p: place || "Unknown place",
    la: Number(pl.lat.toFixed(4)), lo: Number(pl.lon.toFixed(4)), tz, c: categoryOf(id, nm.desc), w: person.links,
  });
}

writeFileSync("src/data/people.json", JSON.stringify(out));
// The proxy only needs to know which URLs exist.
writeFileSync("src/data/people-slugs.json", JSON.stringify((out as { s: string }[]).map((p) => p.s)));
console.log(`wrote ${out.length} people`, skipped);
