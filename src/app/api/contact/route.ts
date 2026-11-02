import { rateLimited } from "@/lib/rate-limit";

const TOPICS = new Set(["General", "Privacy", "Calculation", "Birth-data source", "Accessibility", "Technical problem"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  if (rateLimited(request, 5)) return Response.json({ error: "Too many messages. Please try again in a minute." }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid form submission." }, { status: 400 });
  }

  // Quietly accept honeypot submissions so bots do not learn how to bypass it.
  if (text(body.website, 200)) return Response.json({ ok: true });

  const name = text(body.name, 120);
  const email = text(body.email, 254);
  const topic = text(body.topic, 40);
  const page = text(body.page, 500);
  const message = text(body.message, 5000);
  if (!name || !EMAIL.test(email) || !TOPICS.has(topic) || message.length < 20 || (page && !isHttpUrl(page))) {
    return Response.json({ error: "Please check the form fields and try again." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  const to = process.env.CONTACT_RECIPIENT_EMAIL?.trim() || process.env.PRIVACY_CONTACT_EMAIL?.trim();
  if (!apiKey || !from || !to) {
    console.error("Contact delivery is not configured.");
    return Response.json({ error: "Messaging is temporarily unavailable. Please try again later." }, { status: 503 });
  }

  const id = crypto.randomUUID();
  const emailText = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Topic: ${topic}`,
    page ? `Page: ${page}` : "Page: Not provided",
    `Reference: ${id}`,
    "",
    message,
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `aspectori-contact/${id}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[Aspectori] ${topic} enquiry`,
        text: emailText,
        tags: [{ name: "source", value: "contact-form" }],
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error(`Contact delivery failed with provider status ${response.status}.`);
      return Response.json({ error: "Your message could not be delivered. Please try again later." }, { status: 502 });
    }
  } catch {
    console.error("Contact delivery request failed.");
    return Response.json({ error: "Your message could not be delivered. Please try again later." }, { status: 502 });
  }

  return Response.json({ ok: true });
}

function isHttpUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
