import { computeCouple } from "@/lib/astro/engine";
import { parseBirth } from "@/lib/astro/parse";
import { handle } from "@/lib/astro/respond";

export const POST = (req: Request) => handle(req, (body) => computeCouple(parseBirth(body.a), parseBirth(body.b)));
