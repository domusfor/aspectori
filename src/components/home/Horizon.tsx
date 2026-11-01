/** Mountains, a horizon glow and a path of light on the water, after the brand moodboard. Decorative. */

const W = 1440;
const HORIZON = 250;

/** A deterministic ridgeline: a few sine octaves, valley-shaped so the light path stays open in the middle. */
function ridge(base: number, height: number, seed: number, valley: number) {
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 6) {
    const t = x / W;
    // Ridged noise: 1 − |sin| makes sharp peaks and rounded valleys, like real mountains.
    const r = (f: number, k: number) => (1 - Math.abs(Math.sin(t * f + seed * k))) ** 2;
    const n = r(5.3, 1) * 0.55 + r(11.9, 2.3) * 0.28 + r(27.1, 4.1) * 0.12 + r(61, 6.7) * 0.05;
    const v = 1 - valley * Math.exp(-((t - 0.5) ** 2) / 0.018); // dip toward the centre
    pts.push(`${x},${(base - (0.25 + 0.75 * n) * height * v).toFixed(1)}`);
  }
  return `M0,${HORIZON + 10} L${pts.join(" L")} L${W},${HORIZON + 10} Z`;
}

const RIDGES = [
  { d: ridge(HORIZON - 30, 120, 1.3, 0.55), fill: "#1a2747", opacity: 0.55 },
  { d: ridge(HORIZON - 8, 92, 4.2, 0.7), fill: "#111b33", opacity: 0.9 },
  { d: ridge(HORIZON + 2, 48, 7.9, 0.85), fill: "#0a1122", opacity: 1 },
];

export default function Horizon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox={`0 0 ${W} 360`} preserveAspectRatio="xMidYMax slice" className={`pointer-events-none ${className}`}>
      <defs>
        <radialGradient id="hz-glow" cx="50%" cy={`${(HORIZON / 360) * 100}%`} r="42%">
          <stop offset="0%" stopColor="#f6dd8f" stopOpacity="0.42" />
          <stop offset="30%" stopColor="#d8b25e" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#d8b25e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hz-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c1528" />
          <stop offset="100%" stopColor="#070b14" />
        </linearGradient>
        <linearGradient id="hz-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff0b8" stopOpacity="0.75" />
          <stop offset="60%" stopColor="#f6dd8f" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#f6dd8f" stopOpacity="0" />
        </linearGradient>
        <filter id="hz-blur" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="7" /></filter>
        <filter id="hz-soft"><feGaussianBlur stdDeviation="1.2" /></filter>
      </defs>
      <rect x="0" y="0" width={W} height="360" fill="url(#hz-glow)" />
      {RIDGES.map((r, i) => <path key={i} d={r.d} fill={r.fill} opacity={r.opacity} />)}
      <rect x="0" y={HORIZON} width={W} height={360 - HORIZON} fill="url(#hz-water)" />
      <rect x="0" y={HORIZON - 0.5} width={W} height="1" fill="#d8b25e" opacity="0.2" />
      <circle cx={W / 2} cy={HORIZON} r="3" fill="#fff4cf" filter="url(#hz-soft)" />
      <path d={`M${W / 2 - 6},${HORIZON} L${W / 2 + 6},${HORIZON} L${W / 2 + 60},360 L${W / 2 - 60},360 Z`} fill="url(#hz-beam)" filter="url(#hz-blur)" className="shimmer" />
      {[0, 1, 2, 3, 4].map((i) => {
        const y = HORIZON + 14 + i * 20;
        const w = 20 + i * 26;
        return <rect key={i} x={W / 2 - w / 2} y={y} width={w} height="1.1" fill="#f6dd8f" opacity={0.4 - i * 0.07} filter="url(#hz-soft)" className="shimmer" style={{ animationDelay: `${i * 0.6}s` }} />;
      })}
    </svg>
  );
}
