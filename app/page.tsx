"use client";

import { useEffect, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { RecipeGrid } from "@/components/RecipeGrid";
import { RecipeGridSkeleton } from "@/components/RecipeCardSkeleton";
import { useDebounce } from "@/lib/useDebounce";
import type { RankedRecipeSummary } from "@/lib/search";

type Status = "idle" | "loading" | "error" | "done";

export default function Home() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const [recipes, setRecipes] = useState<RankedRecipeSummary[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const term = debouncedQuery.trim();

    if (!term) {
      setRecipes([]);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    fetch(`/api/search?ingredient=${encodeURIComponent(term)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setStatus("error");
          setRecipes([]);
        } else {
          setRecipes(data.recipes);
          setStatus("done");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  return (
    <main className="page">
      <section className="hero">
        <p className="hero__eyebrow">What&apos;s in your kitchen?</p>
        <h1 className="hero__title">
          Search recipes
          <br />
          by ingredient.
        </h1>
        <SearchBar value={query} onChange={setQuery} />
      </section>

      <section>
        {status === "idle" && (
          <p className="results__hint">
            Separate multiple ingredients with commas — e.g. &ldquo;chicken,
            garlic, rice&rdquo;. We&apos;ll rank recipes by how many you have.
          </p>
        )}
        {status === "loading" && <RecipeGridSkeleton />}
        {status === "error" && (
          <p className="results__hint results__hint--error">
            Something went wrong. Try again.
          </p>
        )}
        {status === "done" && recipes.length === 0 && (
          <p className="results__hint">
            No recipes found for &ldquo;{debouncedQuery}&rdquo;.
          </p>
        )}
        <RecipeGrid recipes={recipes} />
      </section>
    </main>
  );
}
