import type { MetadataRoute } from "next";
import { siteUrl } from "@/components/seo/JsonLd";
import { GUIDES } from "@/data/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  return GUIDES.map((guide) => ({ url: `${siteUrl}/learn/${guide.slug}` }));
}
