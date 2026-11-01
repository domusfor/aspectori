#!/usr/bin/env node

const required = [
  "NEXT_PUBLIC_SITE_URL",
  "GOOGLE_SITE_VERIFICATION",
  "BING_SITE_VERIFICATION",
  "PRIVACY_CONTROLLER_NAME",
  "PRIVACY_CONTACT_EMAIL",
  "PRIVACY_LEGAL_BASIS",
  "PRIVACY_HOSTING_PROVIDER",
  "PRIVACY_GEOCODER_PROVIDER",
  "PRIVACY_LOG_RETENTION",
  "PRIVACY_TRANSFER_INFO",
  "SWISS_EPHEMERIS_LICENSE_MODE",
  "GEOCODER_URL",
];

const failures = required.filter((name) => !process.env[name]?.trim()).map((name) => `${name} is missing`);
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
if (siteUrl) {
  try {
    const parsed = new URL(siteUrl);
    if (parsed.protocol !== "https:") failures.push("NEXT_PUBLIC_SITE_URL must use HTTPS");
    if (/localhost|example\.com$/i.test(parsed.hostname)) failures.push("NEXT_PUBLIC_SITE_URL must be the final public host");
    if (parsed.pathname !== "/" || parsed.search || parsed.hash) failures.push("NEXT_PUBLIC_SITE_URL must be an origin without a path, query or fragment");
  } catch {
    failures.push("NEXT_PUBLIC_SITE_URL must be a valid absolute URL");
  }
}

if (process.env.PRIVACY_CONTACT_EMAIL && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.PRIVACY_CONTACT_EMAIL)) {
  failures.push("PRIVACY_CONTACT_EMAIL must be a valid email address");
}

const license = process.env.SWISS_EPHEMERIS_LICENSE_MODE?.toLowerCase();
if (license && !["agpl", "commercial"].includes(license)) {
  failures.push("SWISS_EPHEMERIS_LICENSE_MODE must be agpl or commercial");
}
if (license === "agpl" && !process.env.NEXT_PUBLIC_SOURCE_URL?.trim()) {
  failures.push("NEXT_PUBLIC_SOURCE_URL is required for the AGPL release path");
}

const geocoder = process.env.GEOCODER_URL?.trim() ?? "";
if (/^https:\/\/geocoding-api\.open-meteo\.com/i.test(geocoder)) {
  failures.push("GEOCODER_URL points to Open-Meteo's non-commercial endpoint; configure the customer endpoint or a licensed alternative");
}
if (process.env.EDGE_RATE_LIMIT_CONFIRMED !== "true") {
  failures.push("EDGE_RATE_LIMIT_CONFIRMED must be true after the production /api/* rule is verified");
}

if (failures.length) {
  console.error(`Release check failed (${failures.length}):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("Release configuration check passed.");
