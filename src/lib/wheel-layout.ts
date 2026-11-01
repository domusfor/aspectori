import { norm } from "./astro/zodiac";

/** Space labels in zodiac order; preserve each true longitude for its tick and leader. */
export function spaceWheelLabels<T extends { lon: number }>(points: T[]) {
  const sorted = points.map((point) => ({ ...point, at: norm(point.lon) })).sort((a, b) => a.at - b.at);
  if (sorted.length < 2) return sorted;
  const gap = Math.min(9, 360 / sorted.length);
  // Cut at the largest empty arc so a cluster crossing 0° stays together.
  let cut = 0, largest = -1;
  for (let i = 0; i < sorted.length; i++) {
    const next = i === sorted.length - 1 ? sorted[0].at + 360 : sorted[i + 1].at;
    if (next - sorted[i].at > largest) { largest = next - sorted[i].at; cut = (i + 1) % sorted.length; }
  }
  const placed = [...sorted.slice(cut), ...sorted.slice(0, cut)];
  for (let i = 1; i < placed.length; i++) {
    while (placed[i].at < placed[i - 1].at) placed[i].at += 360;
  }
  // Relax adjacent constraints on an unwrapped circle, including the closing gap.
  // Unlike a short modulo pass, this also handles exact conjunctions without reordering.
  for (let pass = 0; pass < 512; pass++) {
    let adjustment = 0;
    for (let i = 0; i < placed.length; i++) {
      const a = placed[i], b = placed[(i + 1) % placed.length];
      const distance = b.at + (i === placed.length - 1 ? 360 : 0) - a.at;
      if (distance < gap) {
        const shift = (gap - distance) / 2;
        a.at -= shift; b.at += shift; adjustment = Math.max(adjustment, shift);
      }
    }
    if (adjustment < 1e-8) break;
  }
  return placed.map((point) => ({ ...point, at: norm(point.at) }));
}
