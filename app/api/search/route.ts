import { NextRequest, NextResponse } from "next/server";
import { searchByIngredients } from "@/lib/search";
import { getCached, setCached } from "@/lib/cache";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("ingredient");

  if (!raw) {
    return NextResponse.json(
      { error: "ingredient query param is required" },
      { status: 400 }
    );
  }

  const terms = raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (terms.length === 0) {
    return NextResponse.json(
      { error: "at least one ingredient is required" },
      { status: 400 }
    );
  }

  const cacheKey = `search:${terms
    .map((t) => t.toLowerCase())
    .sort()
    .join(",")}`;

  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json({ recipes: cached, cached: true });
  }

  try {
    const recipes = await searchByIngredients(terms);
    setCached(cacheKey, recipes);
    return NextResponse.json({ recipes, cached: false });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 502 }
    );
  }
}
