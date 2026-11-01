import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import CategoryListing from "@/components/famous/CategoryListing";
import RouteLoading from "@/components/site/RouteLoading";
import { CATEGORY_LABELS, categoryHref, categoryPages } from "@/lib/category-pages";
type Props = { params: Promise<{ category: string; page: string }> };
export function generateStaticParams() { return Object.keys(CATEGORY_LABELS).flatMap((category) => Array.from({ length: categoryPages(category) - 1 }, (_, i) => ({ category, page: String(i + 2) }))); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, page } = await params; const label = CATEGORY_LABELS[category];
  return label ? { title: `Famous ${label} birth charts — Page ${page}`, description: `Page ${page} of birth charts for famous ${label}. Browse dated sources, zodiac signs and birth-time ratings.`, alternates: { canonical: categoryHref(category, Number(page)) } } : {};
}
export default function Page({ params }: Props) {
  return <Suspense fallback={<RouteLoading label="chart directory" />}><PaginatedCategoryPage params={params} /></Suspense>;
}
async function PaginatedCategoryPage({ params }: Props) {
  const { category, page } = await params;
  if (!/^[1-9]\d*$/.test(page) || Number(page) > categoryPages(category)) notFound();
  if (page === "1") permanentRedirect(categoryHref(category));
  return <CategoryListing category={category} page={Number(page)} />;
}
