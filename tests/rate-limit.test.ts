import { afterEach, expect, it, vi } from "vitest";
import { rateLimited } from "@/lib/rate-limit";

afterEach(() => vi.useRealTimers());

it("keeps search traffic separate from calculation allowances", () => {
  const search = new Request("http://localhost/api/cities", { headers: { "x-real-ip": "endpoint-test" } });
  const year = new Request("http://localhost/api/year", { headers: { "x-real-ip": "endpoint-test" } });
  expect(rateLimited(search, 2)).toBe(false);
  expect(rateLimited(search, 2)).toBe(false);
  expect(rateLimited(search, 2)).toBe(true);
  expect(rateLimited(year, 1)).toBe(false);
  expect(rateLimited(year, 1)).toBe(true);
});

it("restores the allowance after the sliding window expires", () => {
  vi.useFakeTimers();
  const request = new Request("http://localhost/api/chart", { headers: { "x-real-ip": "window-test" } });
  expect(rateLimited(request, 1)).toBe(false);
  expect(rateLimited(request, 1)).toBe(true);
  vi.advanceTimersByTime(60_001);
  expect(rateLimited(request, 1)).toBe(false);
});
