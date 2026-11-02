import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/contact/route";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  topic: "Calculation",
  page: "https://aspectori.com/calculators/moon-sign",
  message: "The displayed result differs from the source I checked.",
  website: "",
};

const request = (body: unknown, ip: string) => new Request("https://aspectori.com/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-real-ip": ip },
  body: JSON.stringify(body),
});

describe("contact form delivery", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("CONTACT_FROM_EMAIL", "Aspectori <contact@aspectori.com>");
    vi.stubEnv("CONTACT_RECIPIENT_EMAIL", "support@karai.bg");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("sends a plain-text message to Karai with the visitor as reply-to", async () => {
    const send = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "email-id" }), { status: 200 }));
    const response = await POST(request(valid, "contact-success"));
    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledOnce();
    const [url, options] = send.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    const payload = JSON.parse(String(options?.body));
    expect(payload).toMatchObject({
      to: ["support@karai.bg"],
      reply_to: "ada@example.com",
      subject: "[Aspectori] Calculation enquiry",
    });
    expect(payload.text).toContain(valid.message);
    expect(options?.headers).toMatchObject({ Authorization: "Bearer re_test" });
  });

  it("rejects invalid fields before contacting the provider", async () => {
    const send = vi.spyOn(globalThis, "fetch");
    const response = await POST(request({ ...valid, email: "invalid", message: "short" }, "contact-invalid"));
    expect(response.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it("quietly accepts honeypot submissions without sending email", async () => {
    const send = vi.spyOn(globalThis, "fetch");
    const response = await POST(request({ ...valid, website: "spam.example" }, "contact-honeypot"));
    expect(response.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it("fails safely when delivery is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const send = vi.spyOn(globalThis, "fetch");
    const response = await POST(request(valid, "contact-unconfigured"));
    expect(response.status).toBe(503);
    expect(send).not.toHaveBeenCalled();
  });
});
