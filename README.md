# 🍽️ Ingredient — Recipe Search Engine

A recipe search engine that lets you search by the ingredients you actually
have on hand, rather than by dish name. Results are ranked by relevance —
how many of your ingredients match, weighted by the order you list them —
with fuzzy typo correction and prioritized coverage for Indian cuisine.

Built as a portfolio/class project to explore search ranking, fuzzy string
matching, and API data normalization in a real full-stack app.

---

## Features

- **Multi-ingredient ranked search** — enter a comma-separated list like
  `chicken, garlic, rice` and get recipes ranked by relevance, not just
  keyword presence
- **Order-weighted ranking** — ingredients listed first count more toward
  a recipe's score, on the assumption that people typically name their
  main/staple ingredient first (e.g. "rice, tomato" implies rice-based
  dishes should rank above tomato-only matches)
- **Fuzzy matching** — typos and plural forms (`chiken`, `tomatoe`) are
  corrected against a known ingredient list before searching, using
  Fuse.js
- **Autocomplete** — live ingredient suggestions as you type each
  comma-separated segment, with full keyboard navigation (arrow keys,
  Enter, Escape)
- **Indian cuisine boosting** — recipes tagged with an Indian cuisine
  origin are prioritized as a tiebreaker in the ranking
- **Lazy-loaded recipe details** — full ingredient lists and instructions
  are only fetched when a specific recipe is opened, keeping the search
  results endpoint fast and lightweight
- **Server-side caching** — repeated searches and recipe lookups are
  cached in-memory with a TTL, reducing redundant calls to the external
  API
- **Dynamic metadata** — each recipe page generates its own `<title>` and
  description for better browser tabs, history, and link previews
- **Loading skeletons** — search results show placeholder cards matching
  the final layout while a request is in flight, avoiding layout shift

---

## Tech stack

| Layer          | Choice                                      |
|----------------|----------------------------------------------|
| Framework      | Next.js 15 (App Router), TypeScript          |
| Styling        | Tailwind CSS + custom CSS design tokens      |
| Fuzzy matching | [Fuse.js](https://www.fusejs.io/)            |
| Data source    | [TheMealDB](https://www.themealdb.com/api.php) (free, public API) |
| Caching        | In-memory TTL cache (no external dependency) |

---

## Getting started

```bash
git clone https://github.com/kunal9812/recipe-search-engine.git
cd recipe-search-engine
npm install
```

Create a `.env.local` file in the project root:
MEALDB_BASE_URL=https://www.themealdb.com/api/json/v1/1

Then run the dev server:

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## How the ranking works

TheMealDB's API only supports searching **one ingredient at a time**
(`filter.php?i=<ingredient>`) — there's no native "match all of these"
endpoint. To support multi-ingredient search, the app:

1. Splits the comma-separated query into individual ingredient terms
2. Runs each term through a fuzzy-match step (`lib/ingredients.ts`) to
   correct typos/plurals against TheMealDB's known ingredient list
3. Fans out one API call per resolved ingredient, in parallel
4. Tallies which recipes appear in each result set, and how many of the
   searched ingredients they matched
5. Computes a **weighted score** per recipe — ingredients listed earlier
   in the query contribute more to the score than ones listed later
6. Sorts by: weighted score → raw match count (tiebreaker) → Indian
   cuisine boost (tiebreaker) → alphabetical (final tiebreaker)

This logic lives in `lib/search.ts`.

---

## Project structure
**`app/`**
- `api/search/route.ts` — GET, ranked multi-ingredient search
- `api/recipe/[id]/route.ts` — GET, full recipe detail by id
- `api/ingredients/route.ts` — GET, autocomplete suggestions
- `recipe/[id]/page.tsx` — recipe detail page (server component)
- `page.tsx` — home page (search bar + results)
- `globals.css` — design tokens + component styles

**`components/`**
- `SearchBar.tsx` — debounced input with autocomplete dropdown
- `RecipeCard.tsx` — result card
- `RecipeGrid.tsx` — results grid
- `RecipeCardSkeleton.tsx` — loading placeholder

**`lib/`**
- `mealdb.ts` — thin wrapper around TheMealDB's raw API
- `normalize.ts` — converts raw API shape into internal `Recipe` type
- `search.ts` — multi-ingredient ranking logic
- `ingredients.ts` — fuzzy matching (typo correction + autocomplete)
- `getRecipe.ts` — shared cached recipe fetch (used by page + metadata)
- `cache.ts` — in-memory TTL cache
- `useDebounce.ts` — debounce hook for search input

---

## API routes

### `GET /api/search?ingredient=<comma,separated,terms>`
Returns ranked recipes matching any of the given ingredients.

```json
{
  "recipes": [
    {
      "id": "52795",
      "title": "Chicken Handi",
      "image": "https://...",
      "cuisine": "India",
      "isIndian": true,
      "matchCount": 2,
      "matchedIngredients": ["Chicken", "Garlic"],
      "totalSearched": 2
    }
  ],
  "cached": false
}
```

### `GET /api/recipe/[id]`
Returns full detail (ingredients with measures, instructions, image) for
a single recipe.

### `GET /api/ingredients?q=<partial term>`
Returns up to 6 fuzzy-matched ingredient name suggestions for
autocomplete.

---

## Known limitations

- TheMealDB is a relatively small, general-purpose recipe database — some
  ingredient combinations return few or no results, and Indian cuisine
  coverage in particular is limited (there's currently no supplementary
  data source for this)
- The in-memory cache resets on server restart and doesn't share state
  across multiple server instances — fine for a single-instance deploy,
  not production-grade

## Possible future work

- Save/favorite recipes (would need lightweight auth + a small database)
- Dietary filters (vegetarian, gluten-free, etc.)
- "What can I make with exactly these ingredients" strict mode
- A richer or supplementary Indian recipe data source

---

Built by [Kunal Yadav](https://github.com/kunal9812)
