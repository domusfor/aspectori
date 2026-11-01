import type { MetadataRoute } from "next";
import { siteUrl } from "@/components/seo/JsonLd";
import { ALL_FAMOUS, CATEGORIES } from "@/data/people";
import { comboSlug, SIGN_INFO } from "@/lib/astro/signs";
import { SIGNS } from "@/lib/astro/zodiac";
import { CALCULATORS } from "@/data/calculators";
import { GUIDES } from "@/data/guides";
import { categoryHref, categoryPages } from "@/lib/category-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly") => ({
    url: `${siteUrl}${path}`, priority, changeFrequency,
  });
  return [
    u("/", 1, "weekly"),
    u("/charts", 0.9, "weekly"),
    u("/zodiac", 0.9),
    u("/accuracy", 0.5),
    u("/method", 0.4, "yearly"),
    u("/privacy", 0.3, "yearly"),
    u("/calculators", 0.9),
    ...CALCULATORS.map((tool) => u(`/calculators/${tool.slug}`, 0.8)),
    u("/learn", 0.7),
    ...GUIDES.map((guide) => u(`/learn/${guide.slug}`, 0.7)),
    u("/birth-chart-report", 0.8),
    ...CATEGORIES.map((c) => u(`/charts/category/${c.toLowerCase()}`, 0.7)),
    ...CATEGORIES.flatMap((category) => Array.from({ length: categoryPages(category.toLowerCase()) - 1 }, (_, i) => u(categoryHref(category.toLowerCase(), i + 2), 0.5))),
    ...SIGN_INFO.map((s) => u(`/zodiac/${s.slug}`, 0.8)),
    ...SIGNS.flatMap((a) => SIGNS.map((b) => u(`/zodiac/${comboSlug(a, b)}`, 0.6))),
    // Better-known people first; priority falls gently with fame.
    ...ALL_FAMOUS.map((f, i) => u(`/charts/${f.slug}`, i < 500 ? 0.7 : 0.5, "yearly")),
  ];
}
