"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-md px-4 py-32 text-center">
      <p className="caps text-gold">Something went wrong</p>
      <h1 className="font-serif text-4xl mt-3">The chart could not be drawn.</h1>
      <p className="mt-4 text-ink-2">Your birth data is still in the address bar. Try again, or start over.</p>
      <div className="mt-8 flex justify-center gap-3">
        <button className="btn" onClick={() => retry()}>Try again</button>
        <Link className="btn btn-ghost" href="/">Start over</Link>
      </div>
    </main>
  );
}
