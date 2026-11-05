import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/data/people";
import { allSummaries } from "@/lib/famous-summary";
import { CATEGORY_LABELS, CATEGORY_PAGE_SIZE, categoryHref, categoryPages } from "@/lib/category-pages";
import Crumbs from "../seo/Crumbs";
import PersonCard, { PersonRow } from "./PersonCard";
export default async function CategoryListing({ category, page = 1 }: { category: string; page?: number }) {
  const name = CATEGORIES.find((value) => value.toLowerCase() === category);
  if (!name || !Number.isInteger(page) || page < 1 || page > categoryPages(category)) notFound();
  const people = (await allSummaries()).filter((person) => person.category === name);
  const start = (page - 1) * CATEGORY_PAGE_SIZE;
  const visible = people.slice(start, start + CATEGORY_PAGE_SIZE);
  const pages = categoryPages(category);
  return <main className="mx-auto max-w-[1120px] px-4 sm:px-8 pb-12"><Crumbs items={[["Home", "/"], ["Famous charts", "/charts"], [name, categoryHref(category)], ...(page > 1 ? [[`Page ${page}`, categoryHref(category, page)] as [string, string]] : [])]} /><header className="py-10 max-w-3xl"><p className="kicker text-gold">{people.length.toLocaleString("en")} charts · Page {page} of {pages}</p><h1 className="font-serif text-4xl sm:text-5xl mt-4">Birth charts of famous {CATEGORY_LABELS[category]}{page > 1 ? `: page ${page}` : ""}</h1><p className="text-ink-2 mt-5">See each person’s Sun and Moon signs and how reliable the birth data is. Rising signs appear only when we have a verified birth time. Showing {start + 1}–{start + visible.length}.</p></header><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.slice(0, 6).map((person, i) => <PersonCard key={person.slug} p={person} i={i} heading="h2" />)}</div><ul className="grid gap-x-10 mt-8 md:grid-cols-2">{visible.slice(6).map((person) => <PersonRow key={person.slug} p={person} />)}</ul><nav aria-label="Category pages" className="flex flex-wrap gap-2 mt-10">{page > 1 && <Link className="btn btn-ghost" href={categoryHref(category, page - 1)} rel="prev">Previous</Link>}{Array.from({ length: pages }, (_, i) => i + 1).map((number) => <Link key={number} aria-current={number === page ? "page" : undefined} className={`inline-flex min-h-11 min-w-11 items-center justify-center border px-3 ${number === page ? "border-gold text-gold" : "border-line text-muted"}`} href={categoryHref(category, number)}>{number}</Link>)}{page < pages && <Link className="btn btn-ghost" href={categoryHref(category, page + 1)} rel="next">Next</Link>}</nav></main>;
}
