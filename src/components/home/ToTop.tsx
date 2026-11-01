"use client";

export default function ToTop({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button
      className={className}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        setTimeout(() => document.querySelector<HTMLElement>("#birth-form select")?.focus({ preventScroll: true }), 600);
      }}
    >
      {children}
    </button>
  );
}
