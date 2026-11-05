import Image from "next/image";
import Link from "next/link";
import { AnalyticsSettings } from "./Analytics";

export default function SiteFooter() {
  return (
    <footer className="no-print relative z-10 mx-auto mt-24 w-full max-w-[1120px] px-4 pb-10 sm:px-8">
      <div className="hairline mb-8" />
      <div className="grid gap-8 sm:grid-cols-[1.35fr_1fr_1fr]">
        <div>
          <Image src="/brand/aspectori-logo.png" alt="Aspectori" width={140} height={121} className="h-auto w-[120px]" />
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted">
            Astrological readings are for reflection and entertainment. Positions come from the Swiss Ephemeris and are checked against Astro.com. Famous birth data comes from
            Wikidata and Astro-Databank. City search powered by <a className="underline hover:text-ink" href="https://open-meteo.com/">Open-Meteo</a>.
          </p>
        </div>
        <FooterCol title="Explore" links={[["/", "Birth chart calculator"], ["/calculators", "All calculators"], ["/calculators/birth-time-explorer", "Birth Time Explorer"], ["/weekly-horoscope", "Weekly horoscope"], ["/mercury-retrograde", "Mercury retrograde dates"], ["/moon-phases", "Moon phase dates"], ["/birth-chart-report", "Free PDF report"], ["/charts", "Famous birth charts"], ["/zodiac", "Zodiac signs"]]} />
        <FooterCol title="About & trust" links={[["/about", "About Aspectori"], ["/method", "How it is calculated"], ["/accuracy", "Accuracy"], ["https://github.com/domusfor/aspectori", "Open source"], ["/contact", "Contact"], ["/privacy", "Privacy"], ["/terms", "Terms"]]} />
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="kicker text-gold">{title}</p>
      <ul className="mt-3 grid gap-2 text-sm text-ink-2">
        {links.map(([href, label]) => (
          <li key={href}><Link href={href} className="hover:text-ink">{label}</Link></li>
        ))}
        {title === "About & trust" && <li><AnalyticsSettings /></li>}
      </ul>
    </div>
  );
}
