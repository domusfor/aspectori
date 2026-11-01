import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-32 text-center">
      <p className="caps text-gold">404</p>
      <h1 className="font-serif text-4xl mt-3">Nothing in this part of the sky.</h1>
      <Link className="btn mt-8" href="/">Draw a chart</Link>
    </main>
  );
}
