import type { MetadataRoute } from "next";
import { siteUrl } from "@/components/seo/JsonLd";

export default function robots(): MetadataRoute.Robots {
  return {
    // Allow /report to be crawled so its noindex directive can be read.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
