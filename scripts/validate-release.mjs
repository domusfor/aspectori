#!/usr/bin/env node

const required = [
  "NEXT_PUBLIC_SITE_URL",
  "PRIVACY_CONTROLLER_NAME",
  "PRIVACY_CONTACT_EMAIL",
  "PRIVACY_LEGAL_BASIS",
  "PRIVACY_HOSTING_PROVIDER",
  "PRIVACY_GEOCODER_PROVIDER",
  "PRIVACY_LOG_RETENTION",
  "PRIVACY_TRANSFER_INFO",
  "SWISS_EPHEMERIS_LICENSE_MODE",
  "GEOCODER_URL",
  "GEOCODER_USE_MODE",
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
if (license === "commercial" && process.env.SWISS_EPHEMERIS_COMMERCIAL_LICENSE_CONFIRMED !== "true") {
  failures.push("SWISS_EPHEMERIS_COMMERCIAL_LICENSE_CONFIRMED must be true after the signed Astrodienst license is in force");
}
if (license === "agpl" && !process.env.NEXT_PUBLIC_SOURCE_URL?.trim()) {
  failures.push("NEXT_PUBLIC_SOURCE_URL is required for the AGPL release path");
}
if (license === "agpl" && process.env.NEXT_PUBLIC_SOURCE_URL) {
  try {
    const source = new URL(process.env.NEXT_PUBLIC_SOURCE_URL);
    if (source.protocol !== "https:" || source.hostname !== "github.com") {
      failures.push("NEXT_PUBLIC_SOURCE_URL must be the public HTTPS GitHub repository");
    }
  } catch {
    failures.push("NEXT_PUBLIC_SOURCE_URL must be a valid absolute URL");
  }
}

const geocoder = process.env.GEOCODER_URL?.trim() ?? "";
const geocoderUse = process.env.GEOCODER_USE_MODE?.trim().toLowerCase();
if (geocoderUse && !["noncommercial", "commercial", "self-hosted"].includes(geocoderUse)) {
  failures.push("GEOCODER_USE_MODE must be noncommercial, commercial or self-hosted");
}
if (/^https:\/\/geocoding-api\.open-meteo\.com/i.test(geocoder) && geocoderUse !== "noncommercial") {
  failures.push("Open-Meteo's open-access endpoint requires GEOCODER_USE_MODE=noncommercial");
}
if (geocoderUse === "commercial" && !process.env.GEOCODER_API_KEY?.trim()) {
  failures.push("GEOCODER_API_KEY is required for commercial geocoding");
}
if (process.env.EDGE_RATE_LIMIT_CONFIRMED !== "true") {
  failures.push("EDGE_RATE_LIMIT_CONFIRMED must be true after the production /api/* rule is verified");
}

const warnings = ["GOOGLE_SITE_VERIFICATION", "BING_SITE_VERIFICATION"]
  .filter((name) => !process.env[name]?.trim())
  .map((name) => `${name} is not set; add it after webmaster-tool ownership is created`);

if (failures.length) {
  console.error(`Release check failed (${failures.length}):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

if (warnings.length) console.warn(`Release check warnings (${warnings.length}):\n- ${warnings.join("\n- ")}`);
console.log("Release configuration check passed.");
