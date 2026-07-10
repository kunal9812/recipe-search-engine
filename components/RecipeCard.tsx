import Image from "next/image";
import Link from "next/link";
import type { RankedRecipeSummary } from "@/lib/search";

export function RecipeCard({ recipe }: { recipe: RankedRecipeSummary }) {
  return (
    <Link
      href={`/recipe/${recipe.id}`}
      className={
        recipe.isIndian ? "recipe-card recipe-card--indian" : "recipe-card"
      }
    >
      <div className="recipe-card__image-wrap">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          sizes="(max-width: 640px) 100vw, 280px"
          className="recipe-card__image"
        />
      </div>
      <div className="recipe-card__body">
        <div className="recipe-card__meta">
          <span className="recipe-card__tag">
            {recipe.matchCount}/{recipe.totalSearched} matched
          </span>
          {recipe.cuisine && (
            <span className="recipe-card__cuisine">{recipe.cuisine}</span>
          )}
        </div>
        <h3 className="recipe-card__title">{recipe.title}</h3>
      </div>
    </Link>
  );
}
