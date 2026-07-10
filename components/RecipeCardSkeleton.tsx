export function RecipeCardSkeleton() {
  return (
    <div className="recipe-card recipe-card--skeleton">
      <div className="recipe-card__image-wrap skeleton-block" />
      <div className="recipe-card__body">
        <div className="skeleton-line skeleton-line--tag" />
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--title-short" />
      </div>
    </div>
  );
}

export function RecipeGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="recipe-grid">
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}
