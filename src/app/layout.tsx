import type { Metadata, Viewport } from "next";
import "@fontsource/cinzel/400.css";
import "@fontsource/cinzel/500.css";
import "@fontsource/cinzel/600.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/600-italic.css";
import "@fontsource/jost/300.css";
import "@fontsource/jost/400.css";
import "@fontsource/jost/500.css";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import JsonLd, { siteUrl, sourceUrl } from "@/components/seo/JsonLd";
import Sky from "@/components/site/Sky";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Free Birth Chart Calculator with Exact Degrees | Aspectori", template: "%s | Aspectori" },
  description:
    "Calculate your Sun, Moon and Rising signs, compare Placidus and whole sign houses, and download a free birth chart PDF. No account or email required.",
  applicationName: "Aspectori",
  alternates: { canonical: "/" },
  openGraph: { siteName: "Aspectori", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  // Search Console and Bing Webmaster verification tokens, set per deployment.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = { themeColor: "#070b14" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="flex min-h-dvh flex-col">
        <a href="#page-content" className="skip-link">Skip to content</a>
        <JsonLd data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Organization", "@id": `${siteUrl}/#org`, name: "Aspectori", url: siteUrl, logo: `${siteUrl}/brand/aspectori-logo.png`, sameAs: [sourceUrl] },
            { "@type": "WebSite", "@id": `${siteUrl}/#site`, name: "Aspectori", url: siteUrl, publisher: { "@id": `${siteUrl}/#org` } },
          ],
        }} />
        <Sky />
        <SiteHeader />
        <div id="page-content" tabIndex={-1} className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
