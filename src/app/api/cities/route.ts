import { rateLimited } from "@/lib/rate-limit";

// City lookup behind our own endpoint: the browser never talks to the geocoder directly,
// so the provider can be swapped (a paid Open-Meteo plan, or self-hosted GeoNames) without
// touching the client. Open-Meteo's free tier is for non-commercial use only.
const GEOCODER = process.env.GEOCODER_URL ?? "https://geocoding-api.open-meteo.com/v1/search";
const GEOCODER_KEY = process.env.GEOCODER_API_KEY;

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  country?: string;
  admin1?: string;
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 80) return Response.json({ results: [] });
  if (rateLimited(req, 120)) return Response.json({ error: "Too many requests." }, { status: 429 });

  const url = new URL(GEOCODER);
  url.searchParams.set("name", q);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  if (GEOCODER_KEY) url.searchParams.set("apikey", GEOCODER_KEY);

  let data: { results?: GeoResult[] };
  try {
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 7 }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`geocoder ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error("city lookup failed", err instanceof Error ? err.message : err);
    return Response.json({ error: "City lookup is unavailable." }, { status: 502 });
  }

  const results = (data.results ?? [])
    .filter((r) => r.timezone)
    .map((r) => ({
      label: [r.name, r.admin1 !== r.name ? r.admin1 : null, r.country].filter(Boolean).join(", "),
      lat: Number(r.latitude.toFixed(4)),
      lon: Number(r.longitude.toFixed(4)),
      tz: r.timezone!,
    }));
  return Response.json({ results }, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
}
