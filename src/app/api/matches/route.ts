import { computeChart } from "@/lib/astro/engine";
import { parseBirth } from "@/lib/astro/parse";
import { handle } from "@/lib/astro/respond";
import { allSummaries } from "@/lib/famous-summary";
import { famousBySlug } from "@/data/people";
import { rankFamousMatches } from "@/lib/famous-matches";

export const POST = (req: Request) => handle(req, async (body) => {
  const chart = computeChart(parseBirth(body));
  const people = await allSummaries();
  return {
    compared: people.length,
    matches: rankFamousMatches(chart, people).map((match) => ({ ...match, birth: famousBySlug(match.person.slug)!.birth })),
  };
}, 30);
