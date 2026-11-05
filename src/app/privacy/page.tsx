import type { Metadata } from "next";
import Crumbs from "@/components/seo/Crumbs";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How Aspectori processes birth details, city searches and technical request data when you create a chart.",
  alternates: { canonical: "/privacy" },
};

const value = (name: string) => process.env[name]?.trim();

export default function PrivacyPage() {
  const controller = value("PRIVACY_CONTROLLER_NAME");
  const email = value("PRIVACY_CONTACT_EMAIL");
  const legalBasis = value("PRIVACY_LEGAL_BASIS");
  const hosting = value("PRIVACY_HOSTING_PROVIDER");
  const geocoder = value("PRIVACY_GEOCODER_PROVIDER");
  const emailProvider = value("PRIVACY_EMAIL_PROVIDER");
  const retention = value("PRIVACY_LOG_RETENTION");
  const transfers = value("PRIVACY_TRANSFER_INFO");
  const missing = [
    ["controller identity", controller],
    ["privacy contact", email],
    ["legal basis", legalBasis],
    ["hosting provider", hosting],
    ["geocoding provider", geocoder],
    ["email delivery provider", emailProvider],
    ["technical-log retention", retention],
    ["international-transfer information", transfers],
  ].filter(([, configured]) => !configured).map(([label]) => label);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-8">
      <Crumbs items={[["Home", "/"], ["Privacy", "/privacy"]]} />
      <p className="kicker mt-10 text-gold">Privacy</p>
      <h1 className="mt-3 font-serif text-5xl font-medium leading-tight">Privacy notice</h1>
      <p className="mt-5 text-sm text-muted">Last updated 2 November 2026</p>

      {missing.length > 0 && (
        <div className="mt-8 rounded border border-tense p-5 text-sm leading-relaxed text-ink-2" role="alert">
          <strong className="text-ink">Release configuration is incomplete.</strong>{" "}
          Do not publish this build until the operator supplies: {missing.join(", ")}.
        </div>
      )}

      <Section title="Who is responsible">
        <p>The controller for this service is <Value>{controller}</Value>.</p>
        <p className="mt-3">For privacy questions and rights requests, use the <Link className="text-gold underline" href="/contact">contact form</Link>. {email ? "Its recipient address is configured privately." : <>Recipient: <Value /></>}</p>
      </Section>

      <Section title="What the service processes">
        <ul className="list-disc space-y-2 pl-5">
          <li>Birth date, local birth time when provided, birthplace coordinates, time zone and any optional comparison label.</li>
          <li>City-search text used to find coordinates and a historical time zone.</li>
          <li>Technical request information handled by the hosting service, such as IP address, timestamp, endpoint, browser information and security events.</li>
          <li>When you contact Aspectori: your name, email address, selected topic, message and any page address you choose to include.</li>
        </ul>
      </Section>

      <Section title="Why it is processed">
        <p>Birth details are processed only to calculate and display the chart, comparison, weekly view and report you request, and to protect the service against errors and abuse.</p>
        <p className="mt-3">The configured legal basis is: <Value>{legalBasis}</Value>.</p>
      </Section>

      <Section title="Where the details go">
        <p>Your saved chart is encoded after the <code>#</code> in the page address. Browsers do not send that fragment in ordinary HTTP requests, but anyone who receives the complete link can read the details in it.</p>
        <p className="mt-3">Calculations send the entered details to Aspectori in a POST request. The application does not write calculation bodies to its database or application logs. The hosting infrastructure may still process technical request logs under its own configured retention controls.</p>
        <p className="mt-3">City-search text goes first to Aspectori, then to the configured geocoding provider. The provider receives the search text and the server connection, rather than a direct request from your browser.</p>
        <p className="mt-3">Contact-form details go to Aspectori&apos;s configured email delivery provider and recipient mailbox so the operator can read and answer your message. They are not added to a marketing list.</p>
      </Section>

      <Section title="Providers, retention and transfers">
        <dl className="grid gap-3 sm:grid-cols-[11rem_1fr]">
          <dt className="text-ink">Hosting</dt><dd><Value>{hosting}</Value></dd>
          <dt className="text-ink">Geocoding</dt><dd><Value>{geocoder}</Value></dd>
          <dt className="text-ink">Email delivery</dt><dd><Value>{emailProvider}</Value></dd>
          <dt className="text-ink">Technical-log retention</dt><dd><Value>{retention}</Value></dd>
          <dt className="text-ink">International transfers</dt><dd><Value>{transfers}</Value></dd>
        </dl>
        <p className="mt-4">Aspectori has no accounts and does not use advertising trackers.</p>
        <p className="mt-3">If you choose Save on this device, your birth details are kept in your own browser&apos;s local storage so you can reopen the chart. They are not sent to us until you open it, and you can remove them with Forget it or by clearing your browser data. Nothing is saved unless you ask.</p>
      </Section>

      <section id="analytics" className="scroll-mt-8"><Section title="Analytics, only if you accept">
        <p>If you choose Accept, Aspectori loads Google Tag Manager and Google Analytics, provided by Google. They set cookies and send Google information such as the pages you visit, how far you scroll, links and downloads you use, your browser and device, and your approximate location. This helps us see which pages are useful. The legal basis is your consent.</p>
        <p className="mt-3">We report the page path without the part of the address that holds birth details. We do not send your birth date, time or place, or a comparison label, to Google as analytics. If you choose Decline, or choose nothing, none of this loads. You can change your choice at any time from the link in the site footer.</p>
      </Section></section>

      <Section title="Your choices and rights">
        <p>You can use an unknown birth time, avoid adding another person, keep the link private, or close the page without saving it. Because Aspectori has no account or chart database, it normally cannot retrieve a chart from your identity.</p>
        <p className="mt-3">Where data-protection law applies, you may request access, correction, deletion, restriction, objection or portability, and may withdraw consent where consent is the basis. You may also complain to the supervisory authority where you live or work. Use the contact form to exercise a right.</p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-10"><h2 className="font-serif text-3xl">{title}</h2><div className="mt-4 leading-relaxed text-ink-2">{children}</div></section>;
}

function Value({ children }: { children?: React.ReactNode }) {
  return children ? <strong className="font-medium text-ink">{children}</strong> : <strong className="font-medium text-tense">Not configured</strong>;
}
