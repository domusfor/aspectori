import type { Metadata } from "next";
import Link from "next/link";
import Crumbs from "@/components/seo/Crumbs";
import WeeklyDashboard from "@/components/WeeklyDashboard";

export const metadata: Metadata = {
  title: "Free Personalized Weekly Horoscope From Your Chart",
  description: "A free weekly horoscope calculated from real transits to your own birth chart, not your Sun sign. No account or email. Reopen it every week from your browser.",
  alternates: { canonical: "/weekly-horoscope" },
};

export default function Page() {
  return <main className="mx-auto max-w-[1120px] px-4 sm:px-8 pb-12">
    <Crumbs items={[["Home", "/"], ["Your week", "/weekly-horoscope"]]} />
    <header className="max-w-3xl py-10">
      <p className="kicker text-gold">Free · No account · No email</p>
      <h1 className="font-serif text-4xl sm:text-6xl mt-4 leading-tight">Your personal weekly horoscope</h1>
      <p className="mt-5 text-lg text-ink-2 leading-relaxed">Sun-sign horoscopes give everyone born in the same month the same text. This one starts from your chart: it finds which planets are aligned with your own placements over the next seven days.</p>
    </header>
    <WeeklyDashboard />
    <div className="grid gap-8 mt-16 md:grid-cols-3">
      <section><h2 className="font-serif text-2xl">How the themes are chosen</h2><p className="text-sm text-ink-2 leading-relaxed mt-3">We check the sky every six hours for the next seven UTC days and keep contacts within 1° of your natal planets and angles. Up to three become themes, each with its calculation visible. <Link className="text-gold underline" href="/method#week">Read the method</Link>.</p></section>
      <section><h2 className="font-serif text-2xl">Coming back without an account</h2><p className="text-sm text-ink-2 leading-relaxed mt-3">Choose to save your chart and it stays in this browser, not on our servers. A calendar reminder repeats each Monday and holds only a link to this page. Neither needs your email address.</p></section>
      <section><h2 className="font-serif text-2xl">What it is and is not</h2><p className="text-sm text-ink-2 leading-relaxed mt-3">The planetary positions are calculated. The meanings are astrological interpretations offered for reflection and entertainment. They do not predict events and are not advice about health, money or relationships.</p></section>
    </div>
  </main>;
}
