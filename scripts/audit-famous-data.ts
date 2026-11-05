/**
 * Reports birth-data records that need a person's attention. It changes nothing in the
 * published data: adding a birth time always means checking the source by hand.
 *   npm run data:audit
 *
 * Writes docs/data/birth-time-review-queue.csv: the most widely known people still without
 * a verified time. To resolve a row, read the source, then add a curated record to
 * src/data/famous.ts with a fixture in src/data/astrocom-reference.json. Skip DD ratings.
 */
import { writeFileSync } from "node:fs";
import { FAMOUS } from "../src/data/famous";
import raw from "../src/data/people.json";

const QUEUE_SIZE = 200;
const rows = raw as { q: string; s: string; n: string; b: string; p: string; c: string; w: number }[];
const problems: string[] = [];

const curatedIds = new Set(FAMOUS.flatMap((f) => (f.wikidata ? [f.wikidata] : [])));
for (const row of rows) if (curatedIds.has(row.q)) problems.push(`${row.n}: curated record also present in the Wikidata import`);
for (const person of FAMOUS) if (person.birth.time && !person.source.trim()) problems.push(`${person.name}: birth time has no named source`);

const stale = FAMOUS.filter((f) => !f.verifiedOn).map((f) => f.name);
const adb = (name: string) => `https://www.astro.com/astro-databank/${encodeURIComponent(name.split(" ").at(-1)!)},_${encodeURIComponent(name.split(" ").slice(0, -1).join("_"))}`;
const cell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
const queue = [...rows].sort((a, b) => b.w - a.w).slice(0, QUEUE_SIZE);
writeFileSync("docs/data/birth-time-review-queue.csv", [
  ["name", "slug", "wikidata", "birth_date", "birthplace", "category", "wikipedia_editions", "suggested_source", "status", "rating_found", "notes"].join(","),
  ...queue.map((r) => [r.n, r.s, r.q, r.b, r.p, r.c, r.w, adb(r.n), "pending", "", ""].map(cell).join(",")),
].join("\n") + "\n");

console.log(`Review queue: ${queue.length} of ${rows.length} date-only people.`);
console.log(`Curated records with no recorded check date: ${stale.length}${stale.length ? ` (${stale.join(", ")})` : ""}`);
if (problems.length) {
  console.error(`Problems:\n- ${problems.join("\n- ")}`);
  process.exitCode = 1;
}
