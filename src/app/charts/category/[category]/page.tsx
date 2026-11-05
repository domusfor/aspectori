import type { Metadata } from "next";
import { Suspense } from "react";
import CategoryListing from "@/components/famous/CategoryListing";
import RouteLoading from "@/components/site/RouteLoading";
import { CATEGORY_LABELS, CATEGORY_TITLES, categoryHref } from "@/lib/category-pages";
type Props = { params: Promise<{ category: string }> };
export function generateStaticParams() { return Object.keys(CATEGORY_LABELS).map((category) => ({ category })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params; const label = CATEGORY_LABELS[category];
  return label ? { title: `Birth Charts of Famous ${CATEGORY_TITLES[category]}`, description: `Browse the birth charts and zodiac signs of famous ${label}, with birth-time reliability and Sun, Moon and Rising placements.`, alternates: { canonical: categoryHref(category) } } : {};
}
export default function Page({ params }: Props) { return <Suspense fallback={<RouteLoading label="chart directory" />}><CategoryPage params={params} /></Suspense>; }
async function CategoryPage({ params }: Props) { return <CategoryListing category={(await params).category} />; }
