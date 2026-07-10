import { RawMeal } from './mealdb';

export interface Recipe {
  id: string;
  title: string;
  category: string;
  cuisine: string;
  instructions: string;
  image: string;
  ingredients: { name: string; measure: string }[];
}

export function normalizeMeal(raw: RawMeal): Recipe {
  const ingredients: { name: string; measure: string }[] = [];

  for (let i = 1; i <= 20; i++) {
    const name = raw[`strIngredient${i}`];
    const measure = raw[`strMeasure${i}`];
    if (name && name.trim()) {
      ingredients.push({ name: name.trim(), measure: (measure ?? '').trim() });
    }
  }

  return {
    id: raw.idMeal,
    title: raw.strMeal,
    category: raw.strCategory,
    cuisine: raw.strArea,
    instructions: raw.strInstructions,
    image: raw.strMealThumb,
    ingredients,
  };
}
