import Fuse from "fuse.js";
import { getCached, setCached } from "./cache";

const BASE_URL = process.env.MEALDB_BASE_URL;
const CACHE_KEY = "known-ingredients";

interface MealDBIngredient {
  idIngredient: string;
  strIngredient: string;
}

async function fetchKnownIngredients(): Promise<string[]> {
  const cached = getCached<string[]>(CACHE_KEY);
  if (cached) return cached;

  const res = await fetch(`${BASE_URL}/list.php?i=list`);
  if (!res.ok) throw new Error(`Failed to fetch ingredient list: ${res.status}`);
  const data = await res.json();
  const names: string[] = (data.meals ?? []).map(
    (i: MealDBIngredient) => i.strIngredient
  );

  setCached(CACHE_KEY, names);
  return names;
}

let fuseInstance: Fuse<string> | null = null;

async function getFuse(): Promise<Fuse<string>> {
  if (fuseInstance) return fuseInstance;
  const names = await fetchKnownIngredients();
  fuseInstance = new Fuse(names, { threshold: 0.35, includeScore: true });
  return fuseInstance;
}

/**
 * Corrects a typed ingredient term to the closest known MealDB ingredient.
 * Falls back to the original term if nothing matches confidently —
 * better to search for what the user typed than silently drop it.
 */
export async function resolveIngredient(term: string): Promise<string> {
  const normalized = term.trim();
  if (!normalized) return normalized;

  const fuse = await getFuse();
  const results = fuse.search(normalized);

  if (results.length > 0 && (results[0].score ?? 1) < 0.4) {
    return results[0].item;
  }

  return normalized;
}

/**
 * Returns the top N known ingredient names matching a partial term,
 * for autocomplete. Looser than resolveIngredient since we want
 * multiple options, not just the single best correction.
 */
export async function suggestIngredients(
  term: string,
  limit = 6
): Promise<string[]> {
  const trimmed = term.trim();
  if (!trimmed) return [];

  const fuse = await getFuse();
  const results = fuse.search(trimmed, { limit });
  return results.map((r) => r.item);
}
