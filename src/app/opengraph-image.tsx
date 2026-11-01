import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Aspectori: the birth chart that shows its work";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/brand/aspectori-logo.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 70, padding: "0 90px",
          background: "radial-gradient(ellipse 70% 90% at 25% 50%, #1a2a4f 0%, #0b1222 55%, #070b14 100%)",
          color: "#efe6d2",
        }}
      >
        <img src={src} width={400} height={347} alt="" />
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 560 }}>
          <div style={{ fontSize: 58, lineHeight: 1.08 }}>The birth chart that shows its work.</div>
          <div style={{ fontSize: 28, marginTop: 28, color: "#bdb6a5" }}>Exact degrees. Two house systems. A dated year.</div>
          <div style={{ fontSize: 26, marginTop: 10, color: "#d8b25e" }}>Checked against Astro.com.</div>
        </div>
      </div>
    ),
    size,
  );
}
