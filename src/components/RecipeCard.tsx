import type { Ingredient, MacroResult } from "@/types";
import MacroTable from "@/components/MacroTable";

export default function RecipeCard({
  id = "recipe-card",
  name,
  ingredients,
  macros,
  createdAt,
  showBranding = true,
}: {
  id?: string;
  name: string;
  ingredients: Ingredient[];
  macros: MacroResult;
  createdAt?: string;
  showBranding?: boolean;
}) {
  return (
    <div id={id} className="bg-white p-6 rounded-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">{name}</h1>
      {createdAt && (
        <p className="text-gray-500 mb-8">
          Shared recipe &middot;{" "}
          {new Date(createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h2>
      <ul className="mb-8 space-y-2">
        {ingredients.map((ing) => (
          <li
            key={ing.id}
            className="flex items-center bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm"
          >
            <span className="font-medium text-gray-800">{ing.name}</span>
            <span className="text-gray-400 ml-2">
              {ing.amount} {ing.unit}
            </span>
          </li>
        ))}
      </ul>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Macros</h2>
      <MacroTable result={macros} />

      {showBranding && (
        <p className="mt-10 text-center text-sm text-gray-400">Made with Cookbook</p>
      )}
    </div>
  );
}
