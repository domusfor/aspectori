/** The lit part of the Moon as seen from the northern hemisphere. */
export default function MoonPhase({ illumination, waxing, size = 44 }: { illumination: number; waxing: boolean; size?: number }) {
  const r = 20;
  const k = illumination / 100;
  // Terminator: an ellipse whose x-radius runs from r (new/full) through 0 (quarter).
  const rx = Math.abs(1 - 2 * k) * r;
  const lit = waxing ? 1 : 0; // lit limb on the right when waxing
  const sweepOuter = lit;
  const sweepInner = k > 0.5 ? lit : 1 - lit;
  const d = `M 22 2 A ${r} ${r} 0 0 ${sweepOuter} 22 42 A ${rx} ${r} 0 0 ${sweepInner} 22 2 Z`;
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} role="img" aria-label={`Moon ${Number(illumination.toFixed(1))}% lit`}>
      <circle cx="22" cy="22" r={r} fill="#1a2440" stroke="var(--line-2)" strokeWidth="0.6" />
      <path d={d} fill="#f2e3b3" />
    </svg>
  );
}
