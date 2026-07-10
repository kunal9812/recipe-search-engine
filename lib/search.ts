import { searchMealsByIngredient, type RawMeal } from "./mealdb";
import { resolveIngredient } from "./ingredients";

export interface RankedRecipeSummary {
  id: string;
  title: string;
  image: string;
  cuisine: string | null;
  isIndian: boolean;
  matchCount: number;
  matchedIngredients: string[];
  totalSearched: number;
}

export async function searchByIngredients(
  rawTerms: string[]
): Promise<RankedRecipeSummary[]> {
  const terms = rawTerms.map((t) => t.trim()).filter(Boolean);
  if (terms.length === 0) return [];

  const resolvedTerms = await Promise.all(terms.map(resolveIngredient));

  const resultsPerIngredient = await Promise.all(
    resolvedTerms.map((term) => searchMealsByIngredient(term))
  );

  const tally = new Map<string, { meal: RawMeal; matched: Set<string> }>();

  resultsPerIngredient.forEach((meals, idx) => {
    const ingredientLabel = resolvedTerms[idx];
    for (const meal of meals) {
      const entry = tally.get(meal.idMeal);
      if (entry) {
        entry.matched.add(ingredientLabel);
      } else {
        tally.set(meal.idMeal, { meal, matched: new Set([ingredientLabel]) });
      }
    }
  });

  const ranked: RankedRecipeSummary[] = Array.from(tally.values()).map(
    ({ meal, matched }) => {
      const cuisine = (meal.strArea as string | null) ?? null;
      return {
        id: meal.idMeal,
        title: meal.strMeal,
        image: meal.strMealThumb,
        cuisine,
        isIndian: cuisine?.toLowerCase() === "india",
        matchCount: matched.size,
        matchedIngredients: Array.from(matched),
        totalSearched: resolvedTerms.length,
      };
    }
  );

  ranked.sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    if (a.isIndian !== b.isIndian) return a.isIndian ? -1 : 1;
    return a.title.localeCompare(b.title);
  });

  return ranked;
}
