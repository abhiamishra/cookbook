"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Ingredient, MacroResult, SavedRecipe, Unit } from "@/types";
import DeleteRecipeButton from "@/components/DeleteRecipeButton";

const UNITS: Unit[] = ["g", "oz", "cup", "tbsp", "tsp", "ml", "serving", "pc"];

function generateId() {
  return Math.random().toString(36).slice(2);
}

type Row = {
  id: string;
  name: string;
  amount: string;
  unit: Unit;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

function buildInitialRows(recipe: Omit<SavedRecipe, "ownerId">): Row[] {
  return recipe.ingredients.map((ing, i) => {
    const item = recipe.macros.items[i];
    return {
      id: ing.id,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      calories: item?.calories ?? 0,
      protein_g: item?.protein_g ?? 0,
      carbs_g: item?.carbs_g ?? 0,
      fat_g: item?.fat_g ?? 0,
    };
  });
}

export default function EditRecipeForm({ recipe }: { recipe: Omit<SavedRecipe, "ownerId"> }) {
  const router = useRouter();

  const [name, setName] = useState(recipe.name);
  const [servingsInput, setServingsInput] = useState(String(recipe.servings));
  const servings = Math.max(1, parseInt(servingsInput, 10) || 1);
  const [rows, setRows] = useState<Row[]>(buildInitialRows(recipe));

  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newUnit, setNewUnit] = useState<Unit>("g");

  const [recalculating, setRecalculating] = useState(false);
  const [recalcError, setRecalcError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const round1 = (n: number) => Math.round(n * 10) / 10;
    return {
      calories: Math.round(rows.reduce((sum, r) => sum + r.calories, 0)),
      protein_g: round1(rows.reduce((sum, r) => sum + r.protein_g, 0)),
      carbs_g: round1(rows.reduce((sum, r) => sum + r.carbs_g, 0)),
      fat_g: round1(rows.reduce((sum, r) => sum + r.fat_g, 0)),
    };
  }, [rows]);

  function addRow() {
    if (!newName.trim() || !newAmount.trim()) return;
    setRows((prev) => [
      ...prev,
      {
        id: generateId(),
        name: newName.trim(),
        amount: newAmount.trim(),
        unit: newUnit,
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
      },
    ]);
    setNewName("");
    setNewAmount("");
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function updateRowField(id: string, field: keyof Row, value: string) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (field === "name" || field === "amount") return { ...r, [field]: value };
        if (field === "unit") return { ...r, unit: value as Unit };
        return { ...r, [field]: parseFloat(value) || 0 };
      })
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") addRow();
  }

  async function recalculateMacros() {
    if (rows.length === 0) return;
    setRecalculating(true);
    setRecalcError(null);
    try {
      const ingredients: Ingredient[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        amount: r.amount,
        unit: r.unit,
      }));
      const res = await fetch("/api/calculate-macros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });
      if (!res.ok) throw new Error("Failed to calculate macros");
      const data: MacroResult = await res.json();
      setRows((prev) =>
        prev.map((r, i) => {
          const item = data.items[i];
          if (!item) return r;
          return {
            ...r,
            calories: item.calories,
            protein_g: item.protein_g,
            carbs_g: item.carbs_g,
            fat_g: item.fat_g,
          };
        })
      );
    } catch {
      setRecalcError("Couldn't recalculate macros. Please try again.");
    } finally {
      setRecalculating(false);
    }
  }

  async function save() {
    if (!name.trim() || rows.length === 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      const ingredients: Ingredient[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        amount: r.amount,
        unit: r.unit,
      }));
      const macros: MacroResult = {
        items: rows.map((r) => ({
          name: r.name,
          amount: r.amount,
          unit: r.unit,
          calories: r.calories,
          protein_g: r.protein_g,
          carbs_g: r.carbs_g,
          fat_g: r.fat_g,
        })),
        totals,
      };
      const res = await fetch(`/api/recipes/${recipe.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), ingredients, macros, servings }),
      });
      if (!res.ok) throw new Error("Failed to save recipe");
      router.push(`/r/${recipe.slug}`);
      router.refresh();
    } catch {
      setSaveError("Couldn't save this recipe. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit recipe</h1>

      {/* Recipe name & servings */}
      <div className="flex gap-2 mb-4 items-end">
        <input
          type="text"
          placeholder="Recipe name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex flex-col items-start">
          <label htmlFor="servings" className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">
            Servings
          </label>
          <input
            id="servings"
            type="number"
            min={1}
            step={1}
            value={servingsInput}
            onChange={(e) => setServingsInput(e.target.value)}
            onBlur={() => setServingsInput(String(servings))}
            className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Add ingredient row */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Food item (e.g. chicken breast)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[140px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          placeholder="Amount"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={newUnit}
          onChange={(e) => setNewUnit(e.target.value as Unit)}
          className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <button
          onClick={addRow}
          disabled={!newName.trim() || !newAmount.trim()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>

      {/* Ingredients + editable macros */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Ingredients &amp; macros</h2>
        <button
          onClick={recalculateMacros}
          disabled={recalculating || rows.length === 0}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {recalculating ? "Recalculating..." : "Recalculate with AI"}
        </button>
      </div>
      {recalcError && <p className="mb-3 text-sm text-red-600">{recalcError}</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="text-left px-3 py-3">Item</th>
              <th className="text-left px-3 py-3">Amount</th>
              <th className="text-right px-3 py-3">Cal</th>
              <th className="text-right px-3 py-3">Protein</th>
              <th className="text-right px-3 py-3">Carbs</th>
              <th className="text-right px-3 py-3">Fat</th>
              <th className="px-2 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.id} className="bg-white">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => updateRowField(row.id, "name", e.target.value)}
                    className="w-full min-w-[100px] border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={row.amount}
                      onChange={(e) => updateRowField(row.id, "amount", e.target.value)}
                      className="w-16 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      value={row.unit}
                      onChange={(e) => updateRowField(row.id, "unit", e.target.value)}
                      className="border border-gray-200 rounded px-1 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    value={row.calories}
                    onChange={(e) => updateRowField(row.id, "calories", e.target.value)}
                    className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    value={row.protein_g}
                    onChange={(e) => updateRowField(row.id, "protein_g", e.target.value)}
                    className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    value={row.carbs_g}
                    onChange={(e) => updateRowField(row.id, "carbs_g", e.target.value)}
                    className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    value={row.fat_g}
                    onChange={(e) => updateRowField(row.id, "fat_g", e.target.value)}
                    className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-2 py-2 text-right">
                  <button
                    onClick={() => removeRow(row.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none p-1"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold text-gray-900">
              <td className="px-3 py-3" colSpan={2}>
                Total
              </td>
              <td className="px-2 py-3 text-right">{totals.calories}</td>
              <td className="px-2 py-3 text-right">{totals.protein_g}g</td>
              <td className="px-2 py-3 text-right">{totals.carbs_g}g</td>
              <td className="px-2 py-3 text-right">{totals.fat_g}g</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {saveError && <p className="mb-4 text-sm text-red-600 text-center">{saveError}</p>}

      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving || !name.trim() || rows.length === 0}
          className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button
          onClick={() => router.push(`/r/${recipe.slug}`)}
          className="px-4 py-2.5 rounded-lg font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <DeleteRecipeButton
          slug={recipe.slug}
          redirectTo="/"
          className="px-4 py-2.5 rounded-lg font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-40"
        />
      </div>
    </div>
  );
}
