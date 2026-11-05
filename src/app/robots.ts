import type { MetadataRoute } from "next";
import { siteUrl } from "@/components/seo/JsonLd";

export default function robots(): MetadataRoute.Robots {
  return {
    // Allow /report to be crawled so its noindex directive can be read.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: ["/sitemap.xml", "/calculators/sitemap.xml", "/learn/sitemap.xml", "/zodiac/sitemap.xml", "/charts/sitemap.xml"].map((path) => `${siteUrl}${path}`),
    host: siteUrl,
  };
}
