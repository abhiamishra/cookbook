import { NextRequest, NextResponse } from "next/server";
import { createRecipe, listRecipes } from "@/lib/db";
import type { Ingredient, MacroResult } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name: string = typeof body.name === "string" ? body.name.trim() : "";
  const ingredients: Ingredient[] = Array.isArray(body.ingredients) ? body.ingredients : [];
  const macros: MacroResult | null = body.macros ?? null;

  if (!name) {
    return NextResponse.json({ error: "Recipe name is required" }, { status: 400 });
  }
  if (ingredients.length === 0) {
    return NextResponse.json({ error: "At least one ingredient is required" }, { status: 400 });
  }
  if (!macros || !macros.items || !macros.totals) {
    return NextResponse.json({ error: "Macro results are required" }, { status: 400 });
  }

  const recipe = createRecipe(name, ingredients, macros);
  return NextResponse.json({ slug: recipe.slug });
}

export async function GET() {
  return NextResponse.json(listRecipes());
}
