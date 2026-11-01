"use client";

import { useState, type RefObject } from "react";

export default function DownloadCard({ cardRef, fileName, label = "Save card" }: {
  cardRef: RefObject<HTMLElement | null>; fileName: string; label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const save = async () => {
    if (!cardRef.current || busy) return;
    setBusy(true);
    setError(false);
    try {
      await document.fonts.ready;
      const { toPng } = await import("html-to-image");
      const url = await toPng(cardRef.current, { pixelRatio: 3, backgroundColor: "#070b14" });
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
    } catch { setError(true); }
    finally { setBusy(false); }
  };
  return <>
    <button className="btn btn-solid" onClick={save} disabled={busy}>{busy ? "Preparing image…" : label}</button>
    {error && <p role="alert" className="basis-full text-center text-xs text-tense">The image could not be saved. Please try again.</p>}
  </>;
}
