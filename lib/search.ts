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

  // Earlier-typed ingredients are weighted higher — people tend to list
  // their main/staple ingredient first (e.g. "rice, tomato" implies rice
  // is the point of the dish, tomato is secondary)
  const weightByLabel = new Map<string, number>();
  resolvedTerms.forEach((label, idx) => {
    weightByLabel.set(label, resolvedTerms.length - idx);
  });

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

  const withScore = Array.from(tally.values()).map(({ meal, matched }) => {
    const cuisine = (meal.strArea as string | null) ?? null;
    const weightedScore = Array.from(matched).reduce(
      (sum, label) => sum + (weightByLabel.get(label) ?? 0),
      0
    );

    return {
      summary: {
        id: meal.idMeal,
        title: meal.strMeal,
        image: meal.strMealThumb,
        cuisine,
        isIndian: cuisine?.toLowerCase() === "india",
        matchCount: matched.size,
        matchedIngredients: Array.from(matched),
        totalSearched: resolvedTerms.length,
      } satisfies RankedRecipeSummary,
      weightedScore,
    };
  });

  // Weighted score first (respects ingredient order), then raw match
  // count as a tiebreaker, then Indian-cuisine boost, then alphabetical
  withScore.sort((a, b) => {
    if (b.weightedScore !== a.weightedScore)
      return b.weightedScore - a.weightedScore;
    if (b.summary.matchCount !== a.summary.matchCount)
      return b.summary.matchCount - a.summary.matchCount;
    if (a.summary.isIndian !== b.summary.isIndian)
      return a.summary.isIndian ? -1 : 1;
    return a.summary.title.localeCompare(b.summary.title);
  });

  return withScore.map((entry) => entry.summary);
}
