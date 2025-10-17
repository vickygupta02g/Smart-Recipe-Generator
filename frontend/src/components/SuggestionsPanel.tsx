import type { RecipeMatchResult } from "../types/api";

interface SuggestionsPanelProps {
  matches: RecipeMatchResult[];
  suggestions: RecipeMatchResult[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export function SuggestionsPanel({ matches, suggestions, isLoading, onRefresh }: SuggestionsPanelProps) {
  const hasSuggestions = suggestions.length > 0;

  const renderList = (items: RecipeMatchResult[], emptyLabel: string) => {
    if (items.length === 0) {
      return <p className="text-xs text-slate-400">{emptyLabel}</p>;
    }

    return (
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.recipe.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-sm font-semibold text-slate-100">{item.recipe.title}</p>
            <p className="text-xs text-slate-400">
              {item.recipe.cuisine} - {item.recipe.cookingTime} min - {item.recipe.difficulty}
            </p>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Smart suggestions</h3>
          <p className="text-xs text-slate-400">Based on top matches and your saved favorites.</p>
        </div>
        <button
          type="button"
          onClick={() => onRefresh()}
          className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-primary-500 hover:text-primary-300"
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <div className="mt-5 space-y-6">
        <div>
          <h4 className="text-xs uppercase tracking-wide text-slate-400">Top matches</h4>
          <div className="mt-2">
            {renderList(matches, "Run a search to view personalized matches.")}
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wide text-slate-400">For you</h4>
          <div className="mt-2">
            {hasSuggestions
              ? renderList(suggestions, "")
              : isLoading
              ? <p className="text-xs text-slate-400">Loading suggestions...</p>
              : <p className="text-xs text-slate-400">Save or rate recipes to unlock tailored suggestions.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
