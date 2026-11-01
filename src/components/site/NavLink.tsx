"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const path = usePathname();
  const on = href === "/" ? path === "/" : path.startsWith(href);
  return (
    <Link href={href} aria-current={on ? "page" : undefined} className={`nav-link font-display text-[0.62rem] tracking-[0.22em] uppercase sm:text-[0.7rem] ${on ? "text-ink" : "text-muted"}`} data-on={on}>
      {children}
    </Link>
  );
}
