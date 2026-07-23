"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteRecipeButton({
  slug,
  onDeleted,
  redirectTo,
  className,
}: {
  slug: string;
  onDeleted?: () => void;
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this recipe? This can't be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/recipes/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete recipe");
      if (onDeleted) onDeleted();
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      }
    } catch {
      window.alert("Couldn't delete this recipe. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className={
        className ??
        "text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      }
    >
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
