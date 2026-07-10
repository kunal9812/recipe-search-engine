import { NextRequest, NextResponse } from "next/server";
import { suggestIngredients } from "@/lib/ingredients";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");

  if (!q || !q.trim()) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await suggestIngredients(q, 6);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
