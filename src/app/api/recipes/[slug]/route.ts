import { NextRequest, NextResponse } from "next/server";
import { deleteRecipe, getRecipeBySlug, updateRecipe } from "@/lib/db";
import { getSessionId } from "@/lib/session";
import type { Ingredient, MacroResult } from "@/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ownerId = getSessionId(req);
  if (!ownerId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const existing = getRecipeBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }
  if (existing.ownerId !== ownerId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

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

  const updated = updateRecipe(slug, ownerId, { name, ingredients, macros, servings });
  if (!updated) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  return NextResponse.json({ slug: updated.slug });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ownerId = getSessionId(req);
  if (!ownerId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const existing = getRecipeBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }
  if (existing.ownerId !== ownerId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  deleteRecipe(slug, ownerId);
  return NextResponse.json({ ok: true });
}
