import type { MouseEvent } from "react";
import type { RecipeMatchResult } from "../types/api";
import { cn } from "../utils/cn";

interface RecipeCardProps {
  match: RecipeMatchResult;
  servings: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  initialRating: number;
  onRate: (rating: number) => void;
  onViewDetails: () => void;
}

const MAX_RATING = 5;

function formatScore(score: number): string {
  return `${Math.round(score * 100)}% match`;
}

function formatIngredient(name: string): string {
  return name.replace(/(^\w)|(-\w)/g, (segment) => segment.toUpperCase());
}

export function RecipeCard({
  match,
  servings,
  isFavorite,
  onToggleFavorite,
  initialRating,
  onRate,
  onViewDetails,
}: RecipeCardProps) {
  const { recipe } = match;
  const scaledIngredients = match.scaledIngredients ?? recipe.ingredients;

  const handleRate = (event: MouseEvent<HTMLButtonElement>) => {
    const value = Number(event.currentTarget.dataset.value);
    if (!Number.isNaN(value)) {
      onRate(value);
    }
  };

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">{recipe.title}</h3>
          <p className="text-xs uppercase tracking-wide text-primary-300">{formatScore(match.score)}</p>
          <p className="mt-1 text-xs text-slate-400">
            {recipe.cuisine} - {recipe.cookingTime} min - {recipe.difficulty}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          className={cn(
            "rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition",
            isFavorite
              ? "border-primary-400 bg-primary-500/20 text-primary-200"
              : "border-slate-700 text-slate-300 hover:border-primary-500 hover:text-primary-200"
          )}
        >
          {isFavorite ? "Saved" : "Save"}
        </button>
      </header>

      <p className="mt-3 line-clamp-3 text-sm text-slate-300">{recipe.description}</p>

      <section className="mt-4 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Ingredients for {servings} serving{servings > 1 ? "s" : ""}
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-300">
            {scaledIngredients.slice(0, 6).map((ingredient) => (
              <li key={`${ingredient.name}-${ingredient.quantity}`}>{`${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`}</li>
            ))}
          </ul>
          {scaledIngredients.length > 6 && (
            <p className="mt-1 text-[11px] text-slate-500">+ more ingredients</p>
          )}
        </div>

        {match.missingIngredients.length > 0 && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-200">
              Missing ingredients
            </p>
            <p className="mt-1 text-xs text-amber-100">
              {match.missingIngredients.map(formatIngredient).join(", ")}
            </p>
          </div>
        )}

        {match.substitutionOptions.length > 0 && (
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
              Substitutions
            </p>
            <ul className="mt-1 space-y-1 text-xs text-emerald-100">
              {match.substitutionOptions.map((option) => (
                <li key={option.ingredient}>
                  <span className="font-semibold">{formatIngredient(option.ingredient)}:</span> {option.substitutes.join(", ")}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <footer className="mt-auto flex items-center justify-between pt-4">
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_RATING }, (_, index) => index + 1).map((value) => (
            <button
              type="button"
              key={value}
              data-value={value}
              onClick={handleRate}
              className={cn(
                "text-lg transition",
                value <= initialRating ? "text-yellow-300" : "text-slate-600 hover:text-yellow-200"
              )}
              aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
            >
              ★
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onViewDetails}
          className="text-xs font-semibold uppercase tracking-wide text-primary-300 transition hover:text-primary-200"
        >
          View details
        </button>
      </footer>
    </article>
  );
}
