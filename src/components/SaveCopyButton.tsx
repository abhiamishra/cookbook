"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SaveCopyButton({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSaveCopy() {
    setSaving(true);
    try {
      const res = await fetch(`/api/recipes/${slug}/copy`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to save a copy");
      const { slug: newSlug } = await res.json();
      router.push(`/r/${newSlug}/edit`);
      router.refresh();
    } catch {
      window.alert("Couldn't save a copy. Please try again.");
      setSaving(false);
    }
  }

  return (
    <button
      onClick={handleSaveCopy}
      disabled={saving}
      className={
        className ??
        "text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      }
    >
      {saving ? "Saving copy..." : "Save a copy"}
    </button>
  );
}
