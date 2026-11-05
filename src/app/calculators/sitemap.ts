import type { MetadataRoute } from "next";
import { siteUrl } from "@/components/seo/JsonLd";
import { CALCULATORS } from "@/data/calculators";

export default function sitemap(): MetadataRoute.Sitemap {
  return CALCULATORS.map((tool) => ({ url: `${siteUrl}/calculators/${tool.slug}` }));
}
