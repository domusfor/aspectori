import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Aspectori",
  description: "Contact Aspectori about privacy, calculation errors, birth-data sources or the website.",
  alternates: { canonical: "/contact" },
};

const email = process.env.PRIVACY_CONTACT_EMAIL?.trim();

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-8">
      <p className="kicker mt-10 text-gold">Contact</p>
      <h1 className="mt-3 font-serif text-5xl font-medium leading-tight">Tell us what needs attention.</h1>
      <p className="mt-6 text-lg leading-relaxed text-ink-2">
        Contact Aspectori about privacy, accessibility, a calculation result, a famous person&apos;s source data or a technical problem.
      </p>

      <section className="panel mt-9 p-6 sm:p-8">
        <h2 className="font-serif text-3xl">Email</h2>
        {email ? (
          <p className="mt-4 text-ink-2"><a className="text-gold underline" href={`mailto:${email}`}>{email}</a></p>
        ) : (
          <p className="mt-4 text-tense" role="alert">The public contact address is awaiting production configuration.</p>
        )}
        <p className="mt-5 text-sm leading-relaxed text-muted">Include the page address and enough detail to reproduce the issue. Do not email identity documents, payment information or other sensitive records.</p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-3xl">Reporting a chart or source issue</h2>
        <p className="mt-4 leading-relaxed text-ink-2">For a calculation question, include the date, local time, birthplace, selected house system and the value you expected. For a famous chart, include a link to a reliable birth-data source.</p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-3xl">Response and emergencies</h2>
        <p className="mt-4 leading-relaxed text-ink-2">Aspectori is an online information service and does not provide emergency, medical, legal or crisis support. Contact the appropriate local service when urgent help is needed.</p>
      </section>
    </main>
  );
}
