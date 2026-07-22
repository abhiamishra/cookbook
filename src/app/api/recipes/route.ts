import { NextRequest, NextResponse } from "next/server";
import { createRecipe, listRecipes } from "@/lib/db";
import { getSessionId, newSessionId, setSessionCookie } from "@/lib/session";
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

  const servings = Number.isInteger(body.servings) && body.servings > 0 ? body.servings : 1;

  const existingSessionId = getSessionId(req);
  const ownerId = existingSessionId ?? newSessionId();

  const recipe = createRecipe(name, ingredients, macros, ownerId, servings);
  const res = NextResponse.json({ slug: recipe.slug });
  setSessionCookie(res, ownerId);
  return res;
}

export async function GET(req: NextRequest) {
  const ownerId = getSessionId(req);
  if (!ownerId) {
    return NextResponse.json([]);
  }
  const res = NextResponse.json(listRecipes(ownerId));
  setSessionCookie(res, ownerId);
  return res;
}
