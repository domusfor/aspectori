"use client";

import { useSky } from "@/lib/use-sky";
import Wheel from "../Wheel";

/** Decorative rotation of a calculated sky snapshot; not simulated orbital motion. */
export default function HeroSky() {
  const { sky } = useSky();
  if (!sky) return null;
  return (
    <div aria-hidden className="hero-sky pointer-events-none absolute left-1/2 top-[-6%] w-[min(1100px,140vw)] -translate-x-1/2 md:left-[34%]">
      <div className="spin-slower">
        <Wheel chart={sky.chart} sys="whole" className="w-full" animate />
      </div>
    </div>
  );
}
