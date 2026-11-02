import { NextResponse, type NextRequest } from "next/server";
import { FAMOUS } from "@/data/famous";
import imported from "@/data/people-slugs.json";
import { CALCULATORS } from "@/data/calculators";
import { GUIDES } from "@/data/guides";
import { categoryPages } from "@/lib/category-pages";

const SIGNS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
const CATEGORIES = ["art", "business", "film", "music", "politics", "royalty", "science", "sport", "thought", "writing"];

const PEOPLE = new Set([...FAMOUS.map((f) => f.slug), ...(imported as string[])]);
const ZODIAC = new Set([...SIGNS, ...SIGNS.flatMap((a) => SIGNS.map((b) => `${a}-sun-${b}-moon`))]);
const CATS = new Set(CATEGORIES);

// Unknown URLs under these dynamic routes must answer 404, not a streamed 200, so search engines drop them.
export function proxy(req: NextRequest) {
  const [, section, a, b, segment, page] = req.nextUrl.pathname.split("/");
  const known =
    section === "calculators" ? CALCULATORS.some((tool) => tool.slug === a)
    : section === "learn" ? GUIDES.some((guide) => guide.slug === a)
    : section === "zodiac" ? ZODIAC.has(a)
    : section === "charts" && a === "sitemap.xml" ? true
    : a === "category" ? CATS.has(b) && (!segment || segment === "page" && /^[1-9]\d*$/.test(page ?? "") && Number(page) <= categoryPages(b))
    : PEOPLE.has(a);
  if (!known) return NextResponse.rewrite(new URL("/not-found-page", req.url), { status: 404 });
  if (section === "charts" && a === "category" && segment === "page" && page === "1") {
    return NextResponse.redirect(new URL(`/charts/category/${b}`, req.url), 308);
  }
}

export const config = { matcher: ["/charts/:slug", "/charts/category/:category", "/charts/category/:category/page/:page", "/zodiac/:slug", "/calculators/:slug", "/learn/:slug"] };
