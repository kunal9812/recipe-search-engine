const BASE_URL = process.env.MEALDB_BASE_URL;

export interface RawMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  [key: string]: string | null;
}

export async function searchMealsByIngredient(ingredient: string): Promise<RawMeal[]> {
  const res = await fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`);
  if (!res.ok) throw new Error(`MealDB request failed: ${res.status}`);
  const data = await res.json();
  return data.meals ?? [];
}

export async function getMealById(id: string): Promise<RawMeal | null> {
  const res = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
  if (!res.ok) throw new Error(`MealDB request failed: ${res.status}`);
  const data = await res.json();
  return data.meals?.[0] ?? null;
}
