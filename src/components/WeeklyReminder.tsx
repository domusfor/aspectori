"use client";

import { weeklyReminderIcs } from "@/lib/weekly-reminder";

export default function WeeklyReminder() {
  const add = () => {
    const url = URL.createObjectURL(new Blob([weeklyReminderIcs(`${window.location.origin}/weekly-horoscope`)], { type: "text/calendar" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "aspectori-weekly-reading.ics";
    link.click();
    URL.revokeObjectURL(url);
  };
  return <button type="button" className="btn btn-ghost" onClick={add}>Add a Monday reminder</button>;
}
