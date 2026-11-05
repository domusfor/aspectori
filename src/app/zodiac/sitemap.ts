import type { MetadataRoute } from "next";
import { siteUrl } from "@/components/seo/JsonLd";
import { SIGN_INFO } from "@/lib/astro/signs";

/** Sign pages only. The Sun-Moon combination pages are noindex until each has distinct content. */
export default function sitemap(): MetadataRoute.Sitemap {
  return SIGN_INFO.map((sign) => ({ url: `${siteUrl}/zodiac/${sign.slug}` }));
}
