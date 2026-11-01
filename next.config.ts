import type { NextConfig } from "next";

const productionCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  // Native Swiss Ephemeris binding: load from node_modules at runtime, never bundle.
  serverExternalPackages: ["sweph"],
  // Ephemeris and star catalogue are read from disk at runtime by every route that draws a chart.
  outputFileTracingIncludes: {
    "/**": ["./ephe/*"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          ...(process.env.NODE_ENV === "production"
            ? [{ key: "Content-Security-Policy", value: productionCsp }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
