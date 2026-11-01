"use client";

import { useId } from "react";

import { isEasy } from "@/lib/astro/aspects";
import { aspectRef, pointMap, signatureAspect } from "@/lib/astro/reading";
import type { Chart, HouseSystem } from "@/lib/astro/types";
import { ALL_BODY_IDS, norm, POINT_GLYPHS, SIGN_GLYPHS, SLOW, type PointId } from "@/lib/astro/zodiac";
import { spaceWheelLabels } from "@/lib/wheel-layout";

const C = 200;
const R_OUT = 192, R_SIGN = 162, R_DEG = 156, R_PLANET = 132, R_HOUSE = 104, R_ASPECT = 96;
const svgCoord = (value: number) => Math.round(value * 1_000_000) / 1_000_000;

interface Props {
  chart: Chart;
  sys: HouseSystem;
  active?: string | null;
  onSelect?: (ref: string) => void;
  className?: string;
  /** Draw the wheel in on mount. */
  animate?: boolean;
}

type D = React.CSSProperties & { "--d"?: number };
const d = (ms: number): D => ({ "--d": ms });

export default function Wheel({ chart, sys, active, onSelect, className, animate }: Props) {
  const gradientId = useId();
  const pts = pointMap(chart);
  const rot = chart.timeKnown ? pts.asc.lon : 0;
  const xy = (r: number, lon: number) => {
    const t = ((180 + lon - rot) * Math.PI) / 180;
    return [svgCoord(C + r * Math.cos(t)), svgCoord(C - r * Math.sin(t))] as const;
  };
  const mid = (id: PointId) => {
    const p = pts[id];
    if (!p.range) return p.lon;
    const d = norm(p.range.end - p.range.start);
    return norm(p.range.start + (d > 180 ? d - 360 : d) / 2);
  };

  const placed = spaceWheelLabels(ALL_BODY_IDS.map((id) => ({ id, lon: mid(id) })));

  const sig = signatureAspect(chart);
  const lines = chart.aspects.filter((a) => !(SLOW.has(a.a) && SLOW.has(a.b)) && a.a !== "mc" && a.b !== "mc").slice(0, 8);
  const cusps = chart.cusps ? chart.cusps[sys] : null;

  return (
    <svg viewBox="-24 -24 448 448" className={`${className ?? ""} ${animate ? "wheel-draw" : ""}`} role="img" aria-label="Birth chart wheel">
      <desc>Zodiac longitude diagram, not physical orbits. Planet labels are spaced for readability; ticks and connecting leaders identify their plotted positions. Lines show selected aspects. Unknown-time arcs connect the day&apos;s endpoint samples.</desc>
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c9a86a" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#c9a86a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={C} cy={C} r={R_ASPECT} fill={`url(#${gradientId})`} className="fade" style={d(900)} />
      {[R_OUT, R_SIGN, R_DEG, R_HOUSE, R_ASPECT].map((r, i) => (
        <circle
          key={r} cx={C} cy={C} r={r} fill="none" pathLength={1} className="draw" style={d(i * 120)}
          stroke={r === R_OUT ? "var(--gold)" : "var(--line-2)"} strokeOpacity={r === R_OUT ? 0.55 : 1} strokeWidth={r === R_OUT ? 0.8 : 0.5}
          transform={`rotate(180 ${C} ${C})`}
        />
      ))}

      {Array.from({ length: 72 }, (_, i) => {
        const lon = i * 5;
        const [x1, y1] = xy(R_DEG, lon), [x2, y2] = xy(i % 6 === 0 ? R_SIGN : R_DEG + 3, lon);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--line-2)" strokeWidth={0.5} className="fade" style={d(500 + i * 6)} />;
      })}
      {SIGN_GLYPHS.map((g, i) => {
        const [x, y] = xy((R_OUT + R_SIGN) / 2, i * 30 + 15);
        return (
          <text key={i} x={x} y={y} className="glyph fade" style={d(700 + i * 50)} fontSize={14} fill="var(--ink-2)" textAnchor="middle" dominantBaseline="central">
            {g}
          </text>
        );
      })}

      {cusps?.map((c, i) => {
        const angle = i === 0 || i === 3 || i === 6 || i === 9;
        const [x1, y1] = xy(R_ASPECT, c), [x2, y2] = xy(angle ? R_OUT + 6 : R_DEG, c);
        const next = cusps[(i + 1) % 12];
        const [tx, ty] = xy((R_HOUSE + R_ASPECT) / 2, c + norm(next - c) / 2);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={angle ? "var(--gold)" : "var(--line-2)"} strokeWidth={angle ? 0.9 : 0.5} pathLength={1} className="draw" style={d(1000 + i * 40)} />
            <text x={tx} y={ty} fontSize={7} className="fade" style={d(1300 + i * 30)} fill="var(--muted)" textAnchor="middle" dominantBaseline="central" letterSpacing="0.05em">
              {i + 1}
            </text>
          </g>
        );
      })}
      {(chart.stars ?? []).map((st, i) => {
        const [x, y] = xy(R_DEG - 10, st.lon);
        return (
          <text key={`${st.star}-${st.point}`} x={x} y={y} fontSize={8} fill="var(--gold-hi)" textAnchor="middle" dominantBaseline="central" className="fade" style={d(2400 + i * 80)}>
            <title>{st.star}</title>✦
          </text>
        );
      })}
      {chart.timeKnown && (
        <>
          <AngleLabel xy={xy} lon={pts.asc.lon} label="ASC" />
          <AngleLabel xy={xy} lon={pts.mc.lon} label="MC" />
        </>
      )}

      {lines.map((a, li) => {
        const ref = aspectRef(a);
        const isSig = a === sig;
        const on = active === ref;
        const [x1, y1] = xy(R_ASPECT, mid(a.a)), [x2, y2] = xy(R_ASPECT, mid(a.b));
        const color = isSig || on ? "var(--gold)" : isEasy(a) ? "var(--easy)" : "var(--tense)";
        return (
          <line
            key={ref}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={color}
            strokeWidth={isSig || on ? 1.4 : 0.6}
            strokeOpacity={isSig || on ? 1 : 0.55}
            strokeDasharray={a.type === "sextile" || a.type === "trine" ? "3 2" : undefined}
            className={animate ? "fade" : undefined}
            style={{ ...d(isSig ? 2600 : 2100 + li * 80), cursor: onSelect ? "pointer" : undefined }}
            onClick={() => onSelect?.(ref)}
          />
        );
      })}

      {placed.map(({ id, lon, at }, pi) => {
        const p = pts[id];
        const [tx1, ty1] = xy(R_DEG, lon), [tx2, ty2] = xy(R_DEG - 6, lon);
        const [gx, gy] = xy(R_PLANET, at);
        const [lx, ly] = xy(R_PLANET + 10, at);
        const on = active === id;
        return (
          <g key={id} onClick={() => onSelect?.(id)} className="fade" style={{ ...d(1500 + pi * 70), cursor: onSelect ? "pointer" : undefined }}>
            {p.range && <RangeArc xy={xy} from={p.range.start} to={p.range.end} />}
            <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="var(--ink)" strokeWidth={0.8} />
            {Math.abs(norm(at - lon + 180) - 180) > 0.1 && <line x1={tx2} y1={ty2} x2={lx} y2={ly} stroke="var(--ink-2)" strokeOpacity={0.6} strokeWidth={0.5} />}
            {on && <circle cx={gx} cy={gy} r={10} fill="var(--gold-soft)" stroke="var(--gold)" strokeWidth={0.6} />}
            <text x={gx} y={gy} className="glyph" fontSize={15} fill={on ? "#fff6e3" : "var(--ink)"} textAnchor="middle" dominantBaseline="central">
              {POINT_GLYPHS[id]}
              {"︎"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

type XY = (r: number, lon: number) => readonly [number, number];

function AngleLabel({ xy, lon, label }: { xy: XY; lon: number; label: string }) {
  const [x, y] = xy(R_OUT + 3, lon);
  const left = x < C - 1, top = y < C - 1;
  return (
    <text
      x={x + (left ? -2 : 2)} y={y + (top ? -3 : 3)}
      fontSize={7} letterSpacing="0.15em" fill="var(--gold)"
      textAnchor={Math.abs(x - C) < 4 ? "middle" : left ? "end" : "start"}
      dominantBaseline={Math.abs(y - C) < 4 ? "central" : top ? "auto" : "hanging"}
    >
      {label}
    </text>
  );
}

function RangeArc({ xy, from, to }: { xy: XY; from: number; to: number }) {
  const r = R_DEG - 3;
  let d = norm(to - from);
  if (d > 180) d -= 360; // retrograde: the range runs backwards
  if (Math.abs(d) < 1.5) return null; // too small to read as a range
  const [x1, y1] = xy(r, from), [x2, y2] = xy(r, to);
  // Longitude increases counter-clockwise on screen (sweep 0); retrograde sweeps the other way.
  return (
    <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 ${d > 0 ? 0 : 1} ${x2} ${y2}`} fill="none" stroke="var(--gold)" strokeWidth={2.2} strokeOpacity={0.7} strokeLinecap="round" />
  );
}
