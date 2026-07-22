import type { Ingredient } from "@/types";

function formatIngredientLine(ing: Ingredient): string {
  return `${ing.amount} ${ing.unit} ${ing.name}`.trim();
}

export function formatMacrofactorDescription(ingredients: Ingredient[]): string {
  return ingredients.map(formatIngredientLine).join(", ");
}
