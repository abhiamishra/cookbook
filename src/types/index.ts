export type Unit = "g" | "oz" | "cup" | "tbsp" | "tsp" | "ml" | "serving";

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
