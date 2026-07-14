"use client";

import { useState } from "react";

export default function DownloadRecipeImageButton({
  targetId = "recipe-card",
  filename,
}: {
  targetId?: string;
  filename: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleDownload() {
    const el = document.getElementById(targetId);
    if (!el) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(el, { backgroundColor: "#ffffff", pixelRatio: 2 });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      link.click();
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={status === "loading"}
        className="w-full bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === "loading" ? "Generating..." : status === "done" ? "Downloaded!" : "Download as image"}
      </button>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-600 text-center">
          Couldn&apos;t generate image. Try again.
        </p>
      )}
    </div>
  );
}
