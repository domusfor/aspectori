export default function RouteLoading({ label }: { label: string }) {
  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 py-16 sm:px-8" aria-busy="true">
      <p className="kicker text-gold">Aspectori</p>
      <p className="mt-4 font-serif text-3xl text-ink">Loading {label}…</p>
    </main>
  );
}
