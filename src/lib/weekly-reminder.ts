const pad = (n: number) => String(n).padStart(2, "0");
const stamp = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

/**
 * A repeating Monday-morning calendar event, in the viewer's own time. It holds a link
 * and nothing about the person, so no email address or birth detail is involved.
 */
export function weeklyReminderIcs(url: string, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (((8 - now.getDay()) % 7) || 7), 9, 0);
  const end = new Date(start.getTime() + 15 * 60_000);
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Aspectori//Weekly reading//EN", "BEGIN:VEVENT",
    `UID:weekly-reading-${stamp(now)}@aspectori.com`,
    `DTSTAMP:${now.toISOString().replace(/[-:]|\.\d+/g, "")}`,
    `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, "RRULE:FREQ=WEEKLY",
    "SUMMARY:Read my week ahead on Aspectori", `URL:${url}`, `DESCRIPTION:${url}`,
    "END:VEVENT", "END:VCALENDAR", "",
  ].join("\r\n");
}
