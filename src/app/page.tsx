"use client";

import { useState } from "react";
import type { Ingredient, MacroResult, Unit } from "@/types";

const UNITS: Unit[] = ["g", "oz", "cup", "tbsp", "tsp", "ml", "serving"];

function generateId() {
  return Math.random().toString(36).slice(2);
}

export default function Home() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState<Unit>("g");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [result, setResult] = useState<MacroResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addIngredient() {
    if (!name.trim() || !amount.trim()) return;
    setIngredients((prev) => [
      ...prev,
      { id: generateId(), name: name.trim(), amount: amount.trim(), unit },
    ]);
    setName("");
    setAmount("");
    setResult(null);
  }

  function removeIngredient(id: string) {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
    setResult(null);
  }

  async function calculateMacros() {
    if (ingredients.length === 0) return;
    setLoading(true);
    setError(null);
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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") addIngredient();
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Cookbook</h1>
      <p className="text-gray-500 mb-8">Add your ingredients and get accurate macros.</p>

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

      {/* Results table */}
      {result && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Macros</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="text-left px-4 py-3">Item</th>
                  <th className="text-right px-4 py-3">Calories</th>
                  <th className="text-right px-4 py-3">Protein</th>
                  <th className="text-right px-4 py-3">Carbs</th>
                  <th className="text-right px-4 py-3">Fat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.items.map((item, i) => (
                  <tr key={i} className="bg-white">
                    <td className="px-4 py-3 text-gray-800">
                      {item.name}
                      <span className="text-gray-400 text-xs ml-1">
                        {item.amount} {item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{item.calories}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{item.protein_g}g</td>
                    <td className="px-4 py-3 text-right text-gray-700">{item.carbs_g}g</td>
                    <td className="px-4 py-3 text-right text-gray-700">{item.fat_g}g</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold text-gray-900">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right">{result.totals.calories}</td>
                  <td className="px-4 py-3 text-right">{result.totals.protein_g}g</td>
                  <td className="px-4 py-3 text-right">{result.totals.carbs_g}g</td>
                  <td className="px-4 py-3 text-right">{result.totals.fat_g}g</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
