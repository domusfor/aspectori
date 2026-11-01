import Link from "next/link";
import JsonLd, { breadcrumbs } from "./JsonLd";

/** Visible breadcrumb trail plus its BreadcrumbList structured data. */
export default function Crumbs({ items }: { items: [string, string][] }) {
  return (
    <>
      <nav className="pt-2 text-xs text-muted" aria-label="Breadcrumb">
        {items.map(([name, href], i) => (
          <span key={href}>
            {i > 0 && <span className="mx-1.5">/</span>}
            {i < items.length - 1 ? <Link href={href} className="hover:text-ink">{name}</Link> : <span className="text-ink-2">{name}</span>}
          </span>
        ))}
      </nav>
      <JsonLd data={breadcrumbs(items)} />
    </>
  );
}
