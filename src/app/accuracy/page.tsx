import type { Metadata } from "next";
import Link from "next/link";
import Crumbs from "@/components/seo/Crumbs";
import { accuracyReport } from "@/lib/accuracy";

export const metadata: Metadata = {
  title: "How Accurate Is Aspectori? Our Astro.com Checks",
  description: "See Aspectori checked against Astro.com: Sun, Moon and Ascendant for 29 reference charts, including historical time-zone differences.",
  alternates: { canonical: "/accuracy" },
};

export default async function Accuracy() {
  const rows = await accuracyReport();
  const exact = rows.filter((r) => r.points.every((p) => p.diff === 0)).length;
  const tz = rows.filter((r) => r.tzMatches).length;
  const worst = Math.max(...rows.flatMap((r) => r.points.map((p) => Math.abs(p.diff))));
  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 sm:px-8 pb-10">
      <Crumbs items={[["Home", "/"], ["Accuracy", "/accuracy"]]} />
      <header className="pt-6 pb-10 max-w-3xl">
        <p className="rise kicker text-gold">Accuracy</p>
        <h1 className="rise font-serif text-5xl sm:text-6xl font-medium leading-[1.02] mt-4" style={{ "--i": 1 } as React.CSSProperties}>
          {exact} of {rows.length} charts match Astro.com to the arcminute.
        </h1>
        <p className="rise mt-5 text-ink-2 leading-relaxed" style={{ "--i": 2 } as React.CSSProperties}>
          Astro.com is the standard serious astrologers check against. We take their published Sun, Moon and Ascendant for
          famous people with recorded birth times and recompute them. This page is generated from the same comparison our
          test suite runs before every release, so it cannot go stale.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3 mb-12">
        {[[`${exact}/${rows.length}`, "charts exact to the arcminute"], [`${tz}/${rows.length}`, "time zones agree with Astro.com's atlas"], [`${worst}′`, "largest difference in any position"]].map(([n, l]) => (
          <div key={l} className="panel p-6">
            <p className="font-serif text-5xl text-gold-grad">{n}</p>
            <p className="mt-1 text-sm text-ink-2">{l}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted mb-3">Scroll the table sideways to compare the reference positions on a small screen.</p>
      <div className="panel table-scroll overflow-x-auto" role="region" aria-label="Accuracy reference positions" tabIndex={0}>
        <table className="w-full min-w-[760px] text-sm tabular-nums">
          <thead>
            <tr className="caps !text-[0.58rem] text-muted text-left">
              <th className="p-3 font-normal">Chart</th>
              <th className="p-3 font-normal">Point</th>
              <th className="p-3 font-normal">Astro.com</th>
              <th className="p-3 font-normal">Aspectori</th>
              <th className="p-3 font-normal text-center">Match</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) =>
              r.points.map((p, i) => (
                <tr key={r.name + p.label} className={i === 0 ? "border-t border-[var(--line-2)]" : ""}>
                  {i === 0 && (
                    <td rowSpan={3} className="p-3 align-top">
                      <span className="font-serif text-lg">{r.name}</span>
                      <span className="block text-xs text-muted">{r.date} · {r.place} · Rodden {r.rr}</span>
                    </td>
                  )}
                  <td className="p-3 text-ink-2">{p.label}</td>
                  <td className="p-3">{p.astrocom}</td>
                  <td className="p-3">{p.ours}</td>
                  <td className={`p-3 text-center ${p.diff === 0 ? "text-gold" : "text-tense"}`}>{p.diff === 0 ? "✓" : `${p.diff}′`}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-serif text-3xl font-medium">Where we differ, and why</h2>
        <p className="mt-3 text-ink-2 leading-relaxed">
          Positions are identical because both sites use the Swiss Ephemeris. The only differences come from historical
          clocks. For two births before standard time (Sigmund Freud in 1856 and Mohandas Gandhi in 1869), Astro.com&apos;s
          atlas uses a railway or city mean time that the public time-zone database cannot tell apart from local mean time.
          For those, the birth time you enter is interpreted a few minutes differently, and you can set the offset by hand.
        </p>
        <p className="mt-3 text-ink-2 leading-relaxed">
          Famous charts without a recorded birth time are marked Rodden X. We show their Sun and Moon, and leave out the
          Rising sign rather than guess it. <Link href="/method" className="text-gold underline underline-offset-4">Read the full method</Link>.
        </p>
      </section>
    </main>
  );
}
