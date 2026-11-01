import { ALL_FAMOUS } from "@/data/people";
import { rateLimited } from "@/lib/rate-limit";

const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
const INDEX = ALL_FAMOUS.map((f) => ({ key: fold(f.name), slug: f.slug, name: f.name, year: f.birth.date.slice(0, 4), category: f.category, rating: f.rating }));

/** Name search over every famous chart. Prefix matches on any word rank first; the list is already by fame. */
export async function GET(req: Request) {
  const q = fold(new URL(req.url).searchParams.get("q")?.trim() ?? "");
  if (q.length < 2 || q.length > 60) return Response.json({ results: [] });
  if (rateLimited(req, 120)) return Response.json({ error: "Too many requests." }, { status: 429 });
  const starts = INDEX.filter((p) => p.key.startsWith(q) || p.key.includes(` ${q}`));
  const contains = INDEX.filter((p) => !starts.includes(p) && p.key.includes(q));
  const results = [...starts, ...contains].slice(0, 12).map((r) => ({ slug: r.slug, name: r.name, year: r.year, category: r.category, rating: r.rating }));
  return Response.json({ results }, { headers: { "Cache-Control": "public, s-maxage=3600" } });
}
