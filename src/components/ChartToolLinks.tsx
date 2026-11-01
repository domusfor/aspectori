import Link from "next/link";
import { CALCULATORS, type CalculatorMode } from "@/data/calculators";
import type { BirthInput } from "@/lib/astro/types";
import { encodeBirth } from "@/lib/url";

export default function ChartToolLinks({ birth, current }: { birth: BirthInput; current?: CalculatorMode }) {
  const fragment = new URLSearchParams({ b: encodeBirth(birth) }).toString();
  return <details className="panel p-5 mt-5"><summary className="cursor-pointer text-gold min-h-11 flex items-center gap-3"><span aria-hidden>✦</span>Explore more tools with this chart <span aria-hidden>+</span></summary><p className="text-sm text-ink-2 mt-2">Your birth details carry across. No need to type them again.</p><nav aria-label="Tools for this birth chart" className="grid sm:grid-cols-2 gap-3 mt-5">{CALCULATORS.filter((tool) => tool.mode !== current).map((tool) => <Link key={tool.slug} href={`/calculators/${tool.slug}#${fragment}`} className="tool-shortcut">{tool.title.replace(/^Free /, "")}<span aria-hidden>↗</span></Link>)}</nav></details>;
}
