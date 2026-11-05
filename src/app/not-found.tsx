import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-32 text-center">
      <p className="caps text-gold">404</p>
      <h1 className="font-serif text-4xl mt-3">Nothing in this part of the sky.</h1>
      <p className="mt-4 text-ink-2">This page does not exist, or it has moved.</p>
      <Link className="btn mt-8" href="/">Draw my chart</Link>
      <nav aria-label="Popular pages" className="mt-6 flex flex-wrap justify-center gap-x-5 text-sm text-gold">
        <Link className="inline-flex min-h-11 items-center underline" href="/calculators">Calculators</Link>
        <Link className="inline-flex min-h-11 items-center underline" href="/charts">Famous charts</Link>
        <Link className="inline-flex min-h-11 items-center underline" href="/learn">Guides</Link>
      </nav>
    </main>
  );
}
