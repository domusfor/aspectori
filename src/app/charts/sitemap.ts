import type { MetadataRoute } from "next";
import { siteUrl } from "@/components/seo/JsonLd";
import { INDEXABLE_FAMOUS } from "@/data/people";

/** The phased search-launch cohort, separate for Search Console monitoring. */
export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_FAMOUS.map((person) => ({
    url: `${siteUrl}/charts/${person.slug}`,
  }));
}
