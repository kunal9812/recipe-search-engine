import { NextRequest, NextResponse } from 'next/server';
import { getMealById } from '@/lib/mealdb';
import { normalizeMeal } from '@/lib/normalize';
import { getCached, setCached } from '@/lib/cache';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'recipe id is required' }, { status: 400 });
  }

  const cacheKey = `recipe:${id}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json({ recipe: cached, cached: true });
  }

  try {
    const rawMeal = await getMealById(id);
    if (!rawMeal) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    const recipe = normalizeMeal(rawMeal);
    setCached(cacheKey, recipe);
    return NextResponse.json({ recipe, cached: false });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 502 });
  }
}
