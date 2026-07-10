import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRecipeById } from "@/lib/getRecipe";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    return { title: "Recipe not found — Ingredient" };
  }

  return {
    title: `${recipe.title} — Ingredient`,
    description: recipe.instructions
      ? recipe.instructions.slice(0, 155).trim() + "…"
      : `${recipe.title} recipe with ingredients and instructions.`,
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) notFound();

  return (
    <main className="page">
      <Link href="/" className="back-link">
        ← Back to search
      </Link>

      <article className="recipe-detail">
        <div className="recipe-detail__image-wrap">
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            sizes="(max-width: 720px) 100vw, 400px"
            className="recipe-detail__image"
            priority
          />
        </div>

        <div>
          {recipe.cuisine && (
            <span className="recipe-card__tag">{recipe.cuisine}</span>
          )}
          <h1 className="recipe-detail__title">{recipe.title}</h1>

          <h2 className="recipe-detail__subhead">Ingredients</h2>
          <ul className="ingredient-list">
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>
                <span className="ingredient-list__measure">{ing.measure}</span>
                <span className="ingredient-list__name">{ing.name}</span>
              </li>
            ))}
          </ul>

          <h2 className="recipe-detail__subhead">Instructions</h2>
          <p className="recipe-detail__instructions">{recipe.instructions}</p>
        </div>
      </article>
    </main>
  );
}
