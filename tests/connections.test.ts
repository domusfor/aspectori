import { describe, expect, it } from "vitest";
import { computeChart, computeCouple } from "@/lib/astro/engine";
import { rankFamousMatches } from "@/lib/famous-matches";
import type { FamousSummary } from "@/lib/famous-summary";
import { elementBalance } from "@/lib/chart-insights";
import { contactReading, contactTopic, relationshipOf } from "@/lib/comparison-reading";
import { buildReport } from "@/lib/report";
import { handle } from "@/lib/astro/respond";
import { InputError } from "@/lib/astro/time";

const birth = { date: "1990-08-14", time: "14:30", place: { label: "Sofia, Bulgaria", lat: 42.6975, lon: 23.3241, tz: "Europe/Sofia" } };
const person = (slug: string, data: Partial<FamousSummary> = {}): FamousSummary => ({ slug, name: slug, blurb: "Test record", category: "Science", rating: "X", year: "1990", popularity: 10, sun: ["Leo"], moon: ["Gemini"], rising: null, signature: null, ...data });

describe("automatic famous matches", () => {
  it("ranks definite shared placements before possible overlaps or popularity", () => {
    const matches = rankFamousMatches(computeChart(birth), [
      person("possible", { moon: ["Taurus", "Gemini"], popularity: 1000 }),
      person("definite", { popularity: 1 }),
      person("all-three", { rising: "Scorpio", rating: "AA" }),
      person("unrelated", { sun: ["Pisces"], moon: ["Aries"] }),
    ]);
    expect(matches.map((m) => m.person.slug)).toEqual(["all-three", "definite", "possible"]);
    expect(matches[2].reasons.find((r) => r.point === "Moon")?.certain).toBe(false);
  });
  it("does not infer Rising or label an unknown-time Moon overlap as definite", () => {
    const matches = rankFamousMatches(computeChart({ ...birth, time: null }), [person("test", { rising: "Scorpio" })]);
    expect(matches[0].reasons.some((r) => r.point === "Rising")).toBe(false);
    expect(matches[0].reasons.find((r) => r.point === "Moon")?.certain).toBe(false);
  });
  it("bounds the suggestion set and resolves ties consistently", () => {
    const people = [person("z"), person("a"), person("b")];
    expect(rankFamousMatches(computeChart(birth), people, 2).map((m) => m.person.slug)).toEqual(["a", "b"]);
  });
});

describe("readings and information integrity", () => {
  it("counts exactly the ten planets without inflating the chart with angles or extra points", () => {
    const known = elementBalance(computeChart(birth));
    expect(known.counted).toBe(10); expect(known.uncertain).toBe(0);
    const uncertain = elementBalance(computeChart({ ...birth, time: null }));
    expect(uncertain.counted + uncertain.uncertain).toBe(10);
    expect(uncertain.uncertain).toBeGreaterThan(0);
  });
  it("uses planet-specific explanations and relationship-specific prompts without changing geometry", () => {
    const contact = { a: "mercury", b: "moon", type: "square", orb: 1, minOrb: 1, easy: false } as const;
    const friend = contactReading(contact, "friend");
    const family = contactReading(contact, "family");
    expect(friend.interpretation).toContain("Words meet feelings");
    expect(friend.prompt).toContain("friendship");
    expect(family.prompt).toContain("family");
    expect(friend.geometry).toBe(family.geometry);
    expect(friend.angle).toBe(90);
    expect(contactTopic(contact)).toBe("communication");
    expect(relationshipOf("invalid")).toBe("other");
  });
  it("includes every retained comparison contact and identifies missing birth times in the report", () => {
    const result = computeCouple(birth, { ...birth, time: null, date: "1988-03-05" });
    const report = buildReport(result.a, null, "whole", { result, name: "Alex", relationship: "friend" });
    const section = report.sections.find((s) => s.title === "Your connection with Alex")!;
    expect(section.paragraphs.join(" ")).toContain("birth time is missing");
    for (const contact of result.allContacts) expect(section.paragraphs.some((p) => p.startsWith(contactReading(contact).title))).toBe(true);
  });
});

describe("async personalized response handling", () => {
  it("awaits results without caching them", async () => {
    const req = new Request("http://localhost/api/test-async", { method: "POST", body: "{}" });
    const response = await handle(req, async () => ({ matches: ["resolved"] }));
    expect(await response.json()).toEqual({ matches: ["resolved"] });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("handles input failures raised inside an asynchronous callback", async () => {
    const req = new Request("http://localhost/api/test-async-error", { method: "POST", body: "{}" });
    const response = await handle(req, async () => { throw new InputError("Invalid birth details."); });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid birth details." });
  });
});
