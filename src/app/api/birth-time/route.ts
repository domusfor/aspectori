import { computeBirthTimeRange } from "@/lib/astro/engine";
import { parseBirth } from "@/lib/astro/parse";
import { handle } from "@/lib/astro/respond";
import { InputError, parseTime } from "@/lib/astro/time";

export const POST = (req: Request) => handle(req, ({ from, to, ...birth }) => {
  if (typeof from !== "string" || typeof to !== "string") throw new InputError("Choose the earliest and latest possible times.");
  parseTime(from); parseTime(to);
  return computeBirthTimeRange(parseBirth({ ...birth, time: null }), from, to);
}, 30);
