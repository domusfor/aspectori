import type { Metadata } from "next";
import Crumbs from "@/components/seo/Crumbs";
import CalculatorDirectory from "@/components/CalculatorDirectory";
export const metadata: Metadata = { title: "Free Astrology Calculators: Birth Chart & Signs", description: "Free tools for Moon, Rising, Big Three, Venus, Mars, Moon phase, chart ruler, houses, synastry and uncertain birth times. No account required.", alternates: { canonical: "/calculators" } };
export default function Page() {
  return <main className="mx-auto max-w-[1120px] px-4 sm:px-8 pb-12"><Crumbs items={[["Home", "/"], ["Calculators", "/calculators"]]} /><p className="kicker text-gold mt-8">Find your starting point</p><h1 className="font-serif text-5xl mt-4">Free astrology calculators</h1><p className="max-w-2xl mt-5 text-ink-2 leading-relaxed">Start with one question, then explore the rest of your chart. Positions come from the Swiss Ephemeris; interpretive conventions and birth-time limits are explained with each result.</p><CalculatorDirectory /></main>;
}
