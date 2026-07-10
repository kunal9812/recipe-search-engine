import { RecipeCard } from "./RecipeCard";
import type { RankedRecipeSummary } from "@/lib/search";

export function RecipeGrid({ recipes }: { recipes: RankedRecipeSummary[] }) {
  if (recipes.length === 0) return null;

  return (
    <div className="recipe-grid">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
