import { describe, expect, it } from "vitest";
import { spaceWheelLabels } from "@/lib/wheel-layout";
import { norm } from "@/lib/astro/zodiac";

function verify(longitudes: number[]) {
  const input = longitudes.map((lon, id) => ({ lon, id }));
  const placed = spaceWheelLabels(input);
  expect(placed).toHaveLength(input.length);
  expect(new Set(placed.map((p) => p.id)).size).toBe(input.length);
  for (const point of placed) expect(point.lon).toBe(input[point.id].lon);
  const positions = placed.map((p) => p.at).sort((a, b) => a - b);
  for (let i = 0; i < positions.length; i++) {
    expect(norm(positions[(i + 1) % positions.length] - positions[i])).toBeGreaterThanOrEqual(9 - 1e-6);
  }
  return placed;
}

describe("wheel label spacing", () => {
  it("preserves an already separated wheel", () => {
    const points = verify(Array.from({ length: 12 }, (_, i) => 5 + i * 30));
    points.forEach((point) => expect(point.at).toBe(point.lon));
  });
  it("separates twelve exact conjunctions without moving the true degree", () => {
    verify(Array(12).fill(120));
  });
  it("keeps a conjunction spanning 0 degrees together and in zodiac order", () => {
    const points = verify([357, 358, 359, 0, 1, 2, 30, 60, 90, 120, 180, 240]);
    for (const id of [0, 1, 2, 3, 4]) {
      const a = points.find((p) => p.id === id)!, b = points.find((p) => p.id === id + 1)!;
      expect(norm(b.at - a.at)).toBeCloseTo(9, 5);
    }
  });
  it("preserves spacing across a deterministic sample of 1000 crowded wheels", () => {
    let seed = 827;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
    for (let i = 0; i < 1000; i++) verify(Array.from({ length: 12 }, () => norm(random() * (i % 2 ? 25 : 360) + i)));
  });
  it("handles empty and single-label input", () => {
    expect(spaceWheelLabels([])).toEqual([]);
    expect(spaceWheelLabels([{ lon: -2 }])).toEqual([{ lon: -2, at: 358 }]);
  });
});
