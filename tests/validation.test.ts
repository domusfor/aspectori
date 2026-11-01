import { afterEach, describe, expect, it } from "vitest";
import { Settings } from "luxon";
import { parseBirth } from "@/lib/astro/parse";
import { InputError, resolveMoment } from "@/lib/astro/time";
import { decodeBirth, encodeBirth } from "@/lib/url";
import { offsetToMinutes } from "@/lib/offset";
import { POST as couplePost } from "@/app/api/couple/route";

const birth = { date: "1990-08-14", time: "14:30", place: { label: "Sofia", lat: 42.7, lon: 23.3, tz: "Europe/Sofia" } };
const realNow = Settings.now;
afterEach(() => { Settings.now = realNow; Settings.resetCaches(); });

describe("birth data validation", () => {
  it.each([null, [], "1990-08-14", 0, { ...birth, place: [] }, { ...birth, place: { ...birth.place, lat: null } }, { ...birth, place: { ...birth.place, lon: "" } }, { ...birth, offset: true }])("rejects malformed JSON values: %j", (value) => {
    expect(() => parseBirth(value)).toThrow(InputError);
  });

  it.each(["1990-02-30", "1900-02-29", "1990-00-01", "1990-13-01", "1990-01-00", "1799-12-31", "2400-01-01"])("rejects invalid date %s before computation", (date) => {
    expect(() => parseBirth({ ...birth, date })).toThrow(InputError);
  });

  it.each(["24:00", "12:60", "12:30:60", 1230, false])("rejects invalid time %s", (time) => {
    expect(() => parseBirth({ ...birth, time })).toThrow(InputError);
  });

  it("accepts leap days, seconds, and valid IANA aliases", () => {
    expect(parseBirth({ ...birth, date: "2000-02-29", time: "07:08:12", place: { ...birth.place, tz: "Asia/Kolkata" } }).place.tz).toBe("Asia/Kolkata");
    expect(parseBirth({ ...birth, place: { ...birth.place, tz: "US/Eastern" } }).place.tz).toBe("US/Eastern");
  });

  it.each(["", "bad~14:30~42~23~UTC~City", "1990-08-14~14:30~~23~UTC~City", "1990-08-14~14:30~91~23~UTC~City", "1990-08-14~14:30~42~23~Invalid/Zone~City", "1990-08-14~14:30~42~23~UTC~City~bad", "1990-08-14~14:30~42~23~UTC~City~0~extra"])("rejects broken chart links: %s", (value) => {
    expect(decodeBirth(value)).toBeNull();
  });

  it("preserves unknown times and fractional historical offsets in shared links", () => {
    const input = { ...birth, time: null, offset: 57.733 };
    expect(decodeBirth(encodeBirth(input))).toEqual(input);
  });

  it.each(["+01:60", "-05:99", "+15:01", "-16", "abc"])("rejects malformed manual offset %s", (value) => {
    expect(offsetToMinutes(value)).toBeNull();
  });
  it("accepts signed whole and partial-hour offsets", () => {
    expect(offsetToMinutes("+05:45")).toBe(345);
    expect(offsetToMinutes("−03:30")).toBe(-210);
    expect(offsetToMinutes("+15:00")).toBe(900);
  });

  it("returns a client error for a null couple request", async () => {
    const response = await couplePost(new Request("http://localhost/api/couple", { method: "POST", body: "null" }));
    expect(response.status).toBe(400);
  });
});

describe("repeated local clock times", () => {
  it.each(["2026-01-15", "2026-07-15"])("chooses the first occurrence regardless of current season (%s)", (today) => {
    Settings.now = () => Date.parse(`${today}T12:00:00Z`);
    Settings.resetCaches();
    const moment = resolveMoment("2021-10-31", "03:30", { tz: "Europe/Sofia", lon: 23.3 });
    expect(moment.utc.toISO()).toBe("2021-10-31T00:30:00.000Z");
    expect(moment.offset).toBe(180);
    expect(moment.notes[0]).toContain("first one (UTC+3:00)");
  });
});
