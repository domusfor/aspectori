/**
 * Precomputes the Sun/Moon/Rising summary of every imported famous chart into
 * src/data/people-summary.json, so list pages never compute thousands of charts at request time.
 *   npx tsx --conditions=react-server scripts/build-summaries.ts
 * A test recomputes a sample and fails if this file is stale.
 */
import { writeFileSync } from "node:fs";
import { ALL_FAMOUS } from "../src/data/people";
import { summarize } from "../src/lib/famous-summary";

const rows = ALL_FAMOUS.filter((f) => f.rating === "X").map((f) => {
  const s = summarize(f);
  return [s.slug, s.sun.join("/"), s.moon.join("/"), s.signature ?? ""];
});
writeFileSync("src/data/people-summary.json", JSON.stringify(rows));
const counts: Record<string, number> = {};
for (const person of ALL_FAMOUS) counts[person.category.toLowerCase()] = (counts[person.category.toLowerCase()] ?? 0) + 1;
writeFileSync("src/data/category-counts.json", JSON.stringify(counts, null, 2) + "\n");
console.log(`summarized ${rows.length} charts`);
