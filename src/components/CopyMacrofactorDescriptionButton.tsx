"use client";

import { useState } from "react";
import type { Ingredient } from "@/types";
import { formatMacrofactorDescription } from "@/lib/format";

export default function CopyMacrofactorDescriptionButton({
  ingredients,
}: {
  ingredients: Ingredient[];
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(formatMacrofactorDescription(ingredients));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
    >
      {copied ? "Copied!" : "Copy meal description"}
    </button>
  );
}
