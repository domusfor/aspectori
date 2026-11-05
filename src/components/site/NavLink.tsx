"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const path = usePathname();
  const on = href === "/" ? path === "/" : path.startsWith(href);
  return (
    <Link href={href} aria-current={on ? "page" : undefined} className={`nav-link font-display text-[0.68rem] tracking-[0.16em] uppercase sm:text-[0.74rem] sm:tracking-[0.22em] ${on ? "text-ink" : "text-ink-2"}`} data-on={on}>
      {children}
    </Link>
  );
}
