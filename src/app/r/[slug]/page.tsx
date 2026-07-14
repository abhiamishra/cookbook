import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipeBySlug } from "@/lib/db";
import MacroTable from "@/components/MacroTable";

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
      <h1 className="text-3xl font-bold text-gray-900 mb-1">{recipe.name}</h1>
      <p className="text-gray-500 mb-8">
        Shared recipe &middot;{" "}
        {new Date(recipe.createdAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h2>
      <ul className="mb-8 space-y-2">
        {recipe.ingredients.map((ing) => (
          <li
            key={ing.id}
            className="flex items-center bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm"
          >
            <span className="font-medium text-gray-800">{ing.name}</span>
            <span className="text-gray-400 ml-2">
              {ing.amount} {ing.unit}
            </span>
          </li>
        ))}
      </ul>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Macros</h2>
      <MacroTable result={recipe.macros} />

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
