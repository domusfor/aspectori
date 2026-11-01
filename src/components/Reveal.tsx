"use client";

import { useEffect, useRef } from "react";

/** Fades and lifts its children in the first time they scroll into view. */
export default function Reveal({ children, className = "", as: Tag = "div", id }: { children: React.ReactNode; className?: string; as?: "div" | "section"; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!el || motion.matches || !("IntersectionObserver" in window)) return;
    let animation: Animation | undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!motion.matches) animation = el.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    const stop = () => { if (motion.matches) { animation?.cancel(); io.disconnect(); } };
    motion.addEventListener("change", stop);
    io.observe(el);
    return () => { io.disconnect(); animation?.cancel(); motion.removeEventListener("change", stop); };
  }, []);
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} id={id} className={className}>
      {children}
    </Tag>
  );
}
