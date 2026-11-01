/** Hours and minutes east of UTC. Historical manual offsets may reach 15 hours. */
export function offsetToMinutes(value: string): number | null {
  const match = /^([+\-−])?\s*(\d{1,2})(?::?(\d{2}))?$/.exec(value.trim());
  if (!match || Number(match[3] ?? 0) > 59) return null;
  const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0);
  if (minutes > 15 * 60) return null;
  return match[1] === "-" || match[1] === "−" ? -minutes : minutes;
}

export function minutesToOffset(minutes: number) {
  const absolute = Math.abs(Math.round(minutes));
  return `${minutes < 0 ? "-" : "+"}${String(Math.floor(absolute / 60)).padStart(2, "0")}:${String(absolute % 60).padStart(2, "0")}`;
}
