import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms that apply when using Aspectori's calculators, charts, comparisons, guides and downloadable reports.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-8">
      <p className="kicker mt-10 text-gold">Legal</p>
      <h1 className="mt-3 font-serif text-5xl font-medium leading-tight">Terms of use</h1>
      <p className="mt-5 text-sm text-muted">Last updated 1 November 2026</p>

      <Section title="Using Aspectori">
        <p>You may use the public calculators, educational pages and reports for personal, lawful purposes. Do not disrupt the service, bypass access controls, send automated traffic that harms availability, or use the service to violate another person&apos;s rights.</p>
      </Section>

      <Section title="Interpretive content">
        <p>Astrology is an interpretive tradition. Aspectori&apos;s readings and comparisons are supplied for information, reflection and entertainment. They are not scientific assessments and are not medical, mental-health, legal, financial, employment or relationship advice.</p>
      </Section>

      <Section title="Birth details and shared links">
        <p>You are responsible for having an appropriate reason to enter another person&apos;s details. Chart data saved in an Aspectori link appears after the <code>#</code> character. Keep the complete link private when it contains information you do not want to share.</p>
      </Section>

      <Section title="Accuracy and availability">
        <p>Aspectori tests its calculations and documents known limits, but cannot promise that every source record, interpretation or software result is error-free. The service may change, pause or remove features as it is maintained.</p>
      </Section>

      <Section title="Sources and intellectual property">
        <p>Third-party datasets, software, fonts and astronomical data remain subject to their respective licenses. Aspectori&apos;s original design, writing and software may not be republished as a competing service without permission or an applicable open-source right.</p>
      </Section>

      <Section title="Liability">
        <p>To the extent permitted by applicable law, Aspectori is not responsible for decisions made from interpretive content or for indirect loss arising from use, interruption or unavailability of the service. Rights that cannot legally be excluded remain unaffected.</p>
      </Section>

      <Section title="Contact and changes">
        <p>Material changes will be reflected by the date above. Questions about these terms can be sent through the <Link className="text-gold underline" href="/contact">Contact page</Link>.</p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-10"><h2 className="font-serif text-3xl">{title}</h2><div className="mt-4 leading-relaxed text-ink-2">{children}</div></section>;
}
