import type { Ingredient, MacroResult } from "@/types";

function scaleAmountString(amount: string, factor: number): string {
  const match = amount.match(/^(\d+(?:\.\d+)?)/);
  if (!match) return amount;
  const scaled = parseFloat(match[1]) * factor;
  const rounded = Math.round(scaled * 100) / 100;
  return amount.replace(match[1], String(rounded));
}

export function scaleIngredients(ingredients: Ingredient[], factor: number): Ingredient[] {
  if (factor === 1) return ingredients;
  return ingredients.map((ing) => ({ ...ing, amount: scaleAmountString(ing.amount, factor) }));
}

export function scaleMacros(macros: MacroResult, factor: number): MacroResult {
  if (factor === 1) return macros;
  const round1 = (n: number) => Math.round(n * factor * 10) / 10;
  return {
    items: macros.items.map((item) => ({
      ...item,
      amount: scaleAmountString(item.amount, factor),
      calories: Math.round(item.calories * factor),
      protein_g: round1(item.protein_g),
      carbs_g: round1(item.carbs_g),
      fat_g: round1(item.fat_g),
    })),
    totals: {
      calories: Math.round(macros.totals.calories * factor),
      protein_g: round1(macros.totals.protein_g),
      carbs_g: round1(macros.totals.carbs_g),
      fat_g: round1(macros.totals.fat_g),
    },
  };
}
