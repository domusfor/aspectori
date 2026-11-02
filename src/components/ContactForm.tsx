"use client";

import { useState, type FormEvent } from "react";

type Status = { kind: "idle" | "sending" | "success" | "error"; message?: string };

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus({ kind: "sending" });

    try {
      const fields = Object.fromEntries(new FormData(form).entries());
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Your message could not be sent.");
      form.reset();
      setStatus({ kind: "success", message: "Your message has been sent. Thank you." });
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Your message could not be sent." });
    }
  }

  const busy = status.kind === "sending";
  return (
    <form className="mt-6 grid gap-5" onSubmit={submit} aria-busy={busy}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" id="contact-name">
          <input id="contact-name" name="name" className="field mt-2 w-full" autoComplete="name" maxLength={120} required />
        </Field>
        <Field label="Email" id="contact-email">
          <input id="contact-email" name="email" type="email" className="field mt-2 w-full" autoComplete="email" inputMode="email" maxLength={254} required />
        </Field>
      </div>

      <Field label="What is this about?" id="contact-topic">
        <select id="contact-topic" name="topic" className="field mt-2 w-full" defaultValue="General" required>
          <option>General</option>
          <option>Privacy</option>
          <option>Calculation</option>
          <option>Birth-data source</option>
          <option>Accessibility</option>
          <option>Technical problem</option>
        </select>
      </Field>

      <Field label="Page address" hint="optional" id="contact-page">
        <input id="contact-page" name="page" type="url" className="field mt-2 w-full" inputMode="url" maxLength={500} placeholder="https://aspectori.com/…" />
      </Field>

      <Field label="Message" id="contact-message">
        <textarea id="contact-message" name="message" className="field mt-2 min-h-44 w-full resize-y" minLength={20} maxLength={5000} required />
      </Field>

      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button className="btn btn-solid" type="submit" disabled={busy}>{busy ? "Sending…" : "Send message"}</button>
        <p className={status.kind === "error" ? "text-sm text-tense" : "text-sm text-muted"} role="status" aria-live="polite">
          {status.message}
        </p>
      </div>
    </form>
  );
}

function Field({ label, hint, id, children }: { label: string; hint?: string; id: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-ink-2" htmlFor={id}>
      {label}{hint && <span className="text-muted"> ({hint})</span>}
      {children}
    </label>
  );
}
