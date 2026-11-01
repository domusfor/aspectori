import { rateLimited } from "../rate-limit";
import { InputError } from "./time";

const MAX_BODY = 4_000;

export async function handle(req: Request, fn: (body: Record<string, unknown>) => unknown, limit = 60) {
  if (rateLimited(req, limit)) {
    return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  }
  try {
    const text = await req.text();
    if (text.length > MAX_BODY) return Response.json({ error: "Request too large." }, { status: 413 });
    const body = JSON.parse(text) as Record<string, unknown>;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new InputError("Expected a birth data object.");
    // Personalized responses must not be cached. Birth data is not logged or stored.
    return Response.json(await fn(body), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof InputError || err instanceof SyntaxError) {
      return Response.json({ error: err instanceof SyntaxError ? "Malformed request." : err.message }, { status: 400 });
    }
    console.error("chart computation failed", err instanceof Error ? err.message : err);
    return Response.json({ error: "Could not compute this chart." }, { status: 500 });
  }
}
