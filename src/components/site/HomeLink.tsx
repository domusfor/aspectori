"use client";

import Link from "next/link";
import { HASH_EVENT } from "@/lib/use-hash";

/** Link to the home page that also clears a chart held in the URL fragment. */
export default function HomeLink(props: Omit<React.ComponentProps<typeof Link>, "href">) {
  return (
    <Link
      {...props}
      href="/"
      onClick={() => {
        if (window.location.pathname === "/" && window.location.hash) {
          history.replaceState(null, "", "/");
          window.dispatchEvent(new Event(HASH_EVENT));
        }
      }}
    />
  );
}
