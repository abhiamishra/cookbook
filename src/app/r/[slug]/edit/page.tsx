import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getRecipeBySlug } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session";
import EditRecipeForm from "@/components/EditRecipeForm";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);

  if (!recipe) notFound();

  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  if (!sessionId || sessionId !== recipe.ownerId) notFound();

  const { ownerId: _ownerId, ...publicRecipe } = recipe;

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <EditRecipeForm recipe={publicRecipe} />
    </main>
  );
}
