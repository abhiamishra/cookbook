"use client";

import { useEffect, useState } from "react";
import type { Ingredient, MacroResult, RecipeSummary, Unit } from "@/types";
import RecipeCard from "@/components/RecipeCard";
import DownloadRecipeImageButton from "@/components/DownloadRecipeImageButton";

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "recipe"
  );
}

const UNITS: Unit[] = ["g", "oz", "cup", "tbsp", "tsp", "ml", "serving"];

function generateId() {
  return Math.random().toString(36).slice(2);
}

export default function Home() {
  const [recipeName, setRecipeName] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState<Unit>("g");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [result, setResult] = useState<MacroResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  async function fetchRecipes() {
    try {
      const res = await fetch("/api/recipes");
      if (!res.ok) return;
      setRecipes(await res.json());
    } catch {
      // best-effort; the list simply stays empty
    }
  }

  function addIngredient() {
    if (!name.trim() || !amount.trim()) return;
    setIngredients((prev) => [
      ...prev,
      { id: generateId(), name: name.trim(), amount: amount.trim(), unit },
    ]);
    setName("");
    setAmount("");
    setResult(null);
    setShareUrl(null);
    setSavedSlug(null);
  }

  function removeIngredient(id: string) {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
    setResult(null);
    setShareUrl(null);
    setSavedSlug(null);
  }

  async function calculateMacros() {
    if (ingredients.length === 0) return;
    setLoading(true);
    setError(null);
    setShareUrl(null);
    setSavedSlug(null);
    try {
      const res = await fetch("/api/calculate-macros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });
      if (!res.ok) throw new Error("Failed to calculate macros");
      const data: MacroResult = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function saveAndShare() {
    if (!recipeName.trim() || !result) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: recipeName.trim(), ingredients, macros: result }),
      });
      if (!res.ok) throw new Error("Failed to save recipe");
      const { slug } = await res.json();
      setShareUrl(`${window.location.origin}/r/${slug}`);
      setSavedSlug(slug);
      fetchRecipes();
    } catch {
      setSaveError("Couldn't save this recipe. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function copyShareUrl() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function copyRecipeLink(slug: string) {
    await navigator.clipboard.writeText(`${window.location.origin}/r/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug((s) => (s === slug ? null : s)), 2000);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") addIngredient();
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Cookbook</h1>
      <p className="text-gray-500 mb-8">Add your ingredients and get accurate macros.</p>

      {/* Recipe name */}
      <input
        type="text"
        placeholder="Recipe name (e.g. Chicken stir fry)"
        value={recipeName}
        onChange={(e) => setRecipeName(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Input row */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Food item (e.g. chicken breast)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as Unit)}
          className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <button
          onClick={addIngredient}
          disabled={!name.trim() || !amount.trim()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>

      {/* Ingredient list */}
      {ingredients.length > 0 && (
        <ul className="mb-6 space-y-2">
          {ingredients.map((ing) => (
            <li
              key={ing.id}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm"
            >
              <span className="text-gray-800">
                <span className="font-medium">{ing.name}</span>
                <span className="text-gray-400 ml-2">
                  {ing.amount} {ing.unit}
                </span>
              </span>
              <button
                onClick={() => removeIngredient(ing.id)}
                className="text-gray-400 hover:text-red-500 transition-colors ml-4 text-lg leading-none"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {ingredients.length > 0 && (
        <button
          onClick={calculateMacros}
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Calculating...
            </>
          ) : (
            "Calculate Macros"
          )}
        </button>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
      )}

      {/* Results */}
      {result && (
        <div className="mt-8">
          <RecipeCard
            id="recipe-card"
            name={recipeName.trim() || "Recipe"}
            ingredients={ingredients}
            macros={result}
            showBranding
          />

          {/* Save & share */}
          <div className="mt-4 bg-white border border-gray-200 rounded-lg px-4 py-3 space-y-3">
            {!shareUrl ? (
              <>
                <button
                  onClick={saveAndShare}
                  disabled={saving || !recipeName.trim()}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Saving..." : "Save & Share"}
                </button>
                {!recipeName.trim() && (
                  <p className="text-xs text-gray-400 text-center">
                    Add a recipe name above to save and share it.
                  </p>
                )}
                {saveError && (
                  <p className="text-xs text-red-600 text-center">{saveError}</p>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-gray-50"
                  onFocus={(e) => e.target.select()}
                />
                <button
                  onClick={copyShareUrl}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
            )}
            <DownloadRecipeImageButton
              targetId="recipe-card"
              filename={`${savedSlug ?? slugify(recipeName)}-macros.png`}
            />
          </div>
        </div>
      )}

      {/* Saved recipes */}
      {recipes.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent recipes</h2>
          <ul className="space-y-2">
            {recipes.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-800">{r.name}</p>
                  <p className="text-gray-400 text-xs">
                    {r.totals.calories} cal &middot;{" "}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => copyRecipeLink(r.slug)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                  >
                    {copiedSlug === r.slug ? "Copied!" : "Copy link"}
                  </button>
                  <a
                    href={`/r/${r.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                  >
                    View
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
