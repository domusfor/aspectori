import type { MetadataRoute } from "next";
import { siteUrl } from "@/components/seo/JsonLd";
import { CATEGORIES } from "@/data/people";
import { categoryHref, categoryPages } from "@/lib/category-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (path: string) => ({ url: `${siteUrl}${path}` });
  return [
    u("/"),
    u("/charts"),
    u("/zodiac"),
    u("/accuracy"),
    u("/method"),
    u("/about"),
    u("/contact"),
    u("/privacy"),
    u("/terms"),
    u("/calculators"),
    u("/learn"),
    u("/birth-chart-report"),
    u("/weekly-horoscope"),
    u("/mercury-retrograde"),
    u("/moon-phases"),
    ...CATEGORIES.map((c) => u(`/charts/category/${c.toLowerCase()}`)),
    ...CATEGORIES.flatMap((category) => Array.from({ length: categoryPages(category.toLowerCase()) - 1 }, (_, i) => u(categoryHref(category.toLowerCase(), i + 2)))),
  ];
}
