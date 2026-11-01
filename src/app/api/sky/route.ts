import { computeSky } from "@/lib/astro/engine";

// The same answer for everyone for ten minutes, so the CDN serves almost all of it.
export async function GET() {
  return Response.json(computeSky(), {
    headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" },
  });
}
