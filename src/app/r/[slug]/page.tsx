import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipeBySlug } from "@/lib/db";
import ScaledRecipeCard from "@/components/ScaledRecipeCard";
import DownloadRecipeImageButton from "@/components/DownloadRecipeImageButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);

  if (!recipe) {
    return { title: "Recipe not found" };
  }

  const { calories, protein_g, carbs_g, fat_g } = recipe.macros.totals;
  const description = `${calories} cal · ${protein_g}g protein · ${carbs_g}g carbs · ${fat_g}g fat`;

  return {
    title: recipe.name,
    description,
    openGraph: { title: recipe.name, description },
    twitter: { card: "summary_large_image", title: recipe.name, description },
  };
}

export default async function SharedRecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);

  if (!recipe) notFound();

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <ScaledRecipeCard
        id="recipe-card"
        name={recipe.name}
        ingredients={recipe.ingredients}
        macros={recipe.macros}
        createdAt={recipe.createdAt}
        baseServings={recipe.servings}
        showBranding={false}
      />

      <div className="mt-4">
        <DownloadRecipeImageButton targetId="recipe-card" filename={`${recipe.slug}-macros.png`} />
      </div>

      <p className="mt-10 text-center text-sm text-gray-400">
        Made with{" "}
        <Link href="/" className="text-indigo-600 hover:underline">
          Cookbook
        </Link>{" "}
        &mdash; build your own
      </p>
    </main>
  );
}
