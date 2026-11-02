import type { MetadataRoute } from "next";
import { siteUrl } from "@/components/seo/JsonLd";
import { CATEGORIES } from "@/data/people";
import { comboSlug, SIGN_INFO } from "@/lib/astro/signs";
import { SIGNS } from "@/lib/astro/zodiac";
import { CALCULATORS } from "@/data/calculators";
import { GUIDES } from "@/data/guides";
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
    ...CALCULATORS.map((tool) => u(`/calculators/${tool.slug}`)),
    u("/learn"),
    ...GUIDES.map((guide) => u(`/learn/${guide.slug}`)),
    u("/birth-chart-report"),
    ...CATEGORIES.map((c) => u(`/charts/category/${c.toLowerCase()}`)),
    ...CATEGORIES.flatMap((category) => Array.from({ length: categoryPages(category.toLowerCase()) - 1 }, (_, i) => u(categoryHref(category.toLowerCase(), i + 2)))),
    ...SIGN_INFO.map((s) => u(`/zodiac/${s.slug}`)),
    ...SIGNS.flatMap((a) => SIGNS.map((b) => u(`/zodiac/${comboSlug(a, b)}`))),
  ];
}
