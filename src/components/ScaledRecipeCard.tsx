"use client";

import { useState } from "react";
import type { Ingredient, MacroResult } from "@/types";
import RecipeCard from "@/components/RecipeCard";
import { scaleIngredients, scaleMacros } from "@/lib/scale";

export default function ScaledRecipeCard({
  id = "recipe-card",
  name,
  ingredients,
  macros,
  createdAt,
  showBranding = true,
  baseServings,
}: {
  id?: string;
  name: string;
  ingredients: Ingredient[];
  macros: MacroResult;
  createdAt?: string;
  showBranding?: boolean;
  baseServings: number;
}) {
  const [servings, setServings] = useState(baseServings);
  const factor = servings / baseServings;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium text-gray-700">Servings</span>
        <button
          onClick={() => setServings((s) => Math.max(1, s - 1))}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-medium text-gray-900">{servings}</span>
        <button
          onClick={() => setServings((s) => s + 1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          +
        </button>
      </div>
      <RecipeCard
        id={id}
        name={name}
        ingredients={scaleIngredients(ingredients, factor)}
        macros={scaleMacros(macros, factor)}
        createdAt={createdAt}
        showBranding={showBranding}
      />
    </div>
  );
}
