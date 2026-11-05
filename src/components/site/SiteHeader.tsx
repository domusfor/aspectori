import Image from "next/image";
import HomeLink from "./HomeLink";
import NavLink from "./NavLink";

export const NAV = [
  { href: "/calculators", label: "Calculators", short: "Tools" },
  { href: "/charts", label: "Famous charts", short: "Famous" },
  { href: "/weekly-horoscope", label: "Your week", short: "Week" },
  { href: "/learn", label: "Learn", short: "Learn" },
  { href: "/birth-chart-report", label: "Free PDF", short: "Free PDF" },
];

export default function SiteHeader() {
  return (
    <header className="site-header no-print relative z-10 mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 sm:px-8">
      <HomeLink className="group flex min-w-0 items-center gap-2" aria-label="Aspectori home">
        <Image src="/brand/aspectori-mark.png" alt="" width={44} height={35} priority className="h-8 w-auto transition-transform duration-700 group-hover:rotate-[-6deg] sm:h-9" />
        <span className="font-display text-gold-grad text-[0.95rem] tracking-[0.22em] sm:text-xl sm:tracking-[0.28em]">ASPECTORI</span>
      </HomeLink>
      <nav aria-label="Main navigation" className="flex shrink-0 gap-4 sm:gap-7">
        {NAV.map((n) => (
          <NavLink key={n.href} href={n.href}>
            <span className="sm:hidden">{n.short}</span>
            <span className="hidden sm:inline">{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
