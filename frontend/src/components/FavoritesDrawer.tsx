import type { Recipe } from "../types/api";
import { cn } from "../utils/cn";

interface FavoritesDrawerProps {
  open: boolean;
  favorites: Recipe[];
  onClose: () => void;
}

export function FavoritesDrawer({ open, favorites, onClose }: FavoritesDrawerProps) {
  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-40 w-full max-w-sm transform border-l border-slate-800 bg-slate-950 transition-transform duration-300 sm:w-96",
        open ? "translate-x-0" : "translate-x-full"
      )}
      role="complementary"
      aria-label="Saved favorite recipes"
    >
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-100">Favorites</h2>
        <button
          type="button"
          aria-label="Close favorites"
          onClick={onClose}
          className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-slate-300 transition hover:border-primary-500 hover:text-primary-300"
        >
          Close
        </button>
      </div>

      <div className="h-full overflow-y-auto px-5 py-4">
        {favorites.length === 0 ? (
          <p className="text-sm text-slate-400">
            You haven&apos;t saved any recipes yet. Rate or favorite results to build your cookbook.
          </p>
        ) : (
          <ul className="space-y-4">
            {favorites.map((recipe) => (
              <li key={recipe.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-sm font-semibold text-slate-100">{recipe.title}</p>
                <p className="text-xs text-slate-400">
                  {recipe.cuisine} - {recipe.cookingTime} min - {recipe.difficulty}
                </p>
                <p className="mt-2 line-clamp-3 text-xs text-slate-400">{recipe.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
