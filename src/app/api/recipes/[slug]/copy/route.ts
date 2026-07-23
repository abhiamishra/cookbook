import { NextRequest, NextResponse } from "next/server";
import { createRecipe, getRecipeBySlug } from "@/lib/db";
import { getSessionId, newSessionId, setSessionCookie } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const source = getRecipeBySlug(slug);
  if (!source) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  const existingSessionId = getSessionId(req);
  const ownerId = existingSessionId ?? newSessionId();

  const copy = createRecipe(source.name, source.ingredients, source.macros, ownerId, source.servings);

  const res = NextResponse.json({ slug: copy.slug });
  setSessionCookie(res, ownerId);
  return res;
}
