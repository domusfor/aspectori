import App from "@/components/App";
import HomeSections from "@/components/home/HomeSections";
import { allSummaries } from "@/lib/famous-summary";
import JsonLd, { siteUrl } from "@/components/seo/JsonLd";

export default async function Page() {
  const people = await allSummaries();
  return <><JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", name: "Aspectori birth chart calculator", url: siteUrl, applicationCategory: "LifestyleApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }} /><App home={<HomeSections all={people} />} /></>;
}
