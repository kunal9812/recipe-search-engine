import { getMealById } from "./mealdb";
import { normalizeMeal, type Recipe } from "./normalize";
import { getCached, setCached } from "./cache";

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const cacheKey = `recipe:${id}`;
  const cached = getCached<Recipe>(cacheKey);
  if (cached) return cached;

  const raw = await getMealById(id);
  if (!raw) return null;

  const recipe = normalizeMeal(raw);
  setCached(cacheKey, recipe);
  return recipe;
}
