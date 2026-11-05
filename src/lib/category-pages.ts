import counts from "@/data/category-counts.json";
export const CATEGORY_PAGE_SIZE = 96;
export const CATEGORY_COUNTS: Record<string, number> = counts;
export const categoryPages = (category: string) => Math.ceil((CATEGORY_COUNTS[category] ?? 0) / CATEGORY_PAGE_SIZE);
export const categoryHref = (category: string, page = 1) => `/charts/category/${category}${page > 1 ? `/page/${page}` : ""}`;
export const CATEGORY_TITLES: Record<string, string> = {
  film: "Actors and Filmmakers", music: "Singers and Musicians", sport: "Athletes", politics: "Politicians and Leaders",
  science: "Scientists and Inventors", writing: "Writers and Poets", art: "Artists and Architects", business: "Business Leaders",
  royalty: "Royals", thought: "Philosophers and Thinkers",
};
export const CATEGORY_LABELS: Record<string, string> = {
  film: "actors and filmmakers", music: "singers and musicians", sport: "athletes", politics: "politicians and leaders",
  science: "scientists and inventors", writing: "writers and poets", art: "artists and architects", business: "business leaders",
  royalty: "royals", thought: "philosophers and thinkers",
};
