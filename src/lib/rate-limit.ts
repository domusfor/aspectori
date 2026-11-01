// A small per-instance sliding window. It blunts scripted abuse of the compute
// endpoints; for real protection add a Vercel Firewall rate-limit rule as well.
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

export function rateLimited(req: Request, limit: number) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  // Searching for a city must not consume the smaller year-calculation allowance.
  const key = `${ip}|${new URL(req.url).pathname}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent.slice(-(limit + 1)));
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (now - v[v.length - 1] > WINDOW_MS) hits.delete(k);
    while (hits.size > 10_000) hits.delete(hits.keys().next().value!);
  }
  return recent.length > limit;
}
