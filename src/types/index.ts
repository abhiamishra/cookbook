export type Unit = "g" | "oz" | "cup" | "tbsp" | "tsp" | "ml" | "serving" | "pc";

export type Ingredient = {
  id: string;
  name: string;
  amount: string;
  unit: Unit;
};

export type MacroItem = {
  name: string;
  amount: string;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type MacroResult = {
  items: MacroItem[];
  totals: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
};

export type SavedRecipe = {
  id: string;
  slug: string;
  name: string;
  ingredients: Ingredient[];
  macros: MacroResult;
  createdAt: string;
  servings: number;
  ownerId: string | null;
};

export type RecipeSummary = {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
  totals: MacroResult["totals"];
};
