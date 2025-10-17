import { useState } from "react";
import { RecipeCard } from "./components/RecipeCard";
import { IngredientInput } from "./components/IngredientInput";
import { DietaryPreferences } from "./components/DietaryPreferences";
import { FiltersPanel, type FiltersState } from "./components/FiltersPanel";
import { ImageIngredientUploader } from "./components/ImageIngredientUploader";
import { SuggestionsPanel } from "./components/SuggestionsPanel";
import { FavoritesDrawer } from "./components/FavoritesDrawer";
import { RecipeDetailsModal } from "./components/RecipeDetailsModal";
import { useRecipeSearch } from "./hooks/useRecipeSearch";
import { useSuggestions } from "./hooks/useSuggestions";
import { useFavorites } from "./hooks/useFavorites";
import { cn } from "./utils/cn";
import type { RecipeMatchResult } from "./types/api";

function App() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recognizedIngredients, setRecognizedIngredients] = useState<string[]>([]);
  const [filters, setFilters] = useState<FiltersState>({ difficulty: "any" });
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [servings, setServings] = useState<number | undefined>();
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<RecipeMatchResult | null>(null);

  const {
    results,
    isLoading,
    error,
    handleSearch,
    handleGenerate,
    handleClear,
  } = useRecipeSearch();

  const {
    suggestions,
    isLoading: suggestionsLoading,
    fetchSuggestions,
  } = useSuggestions();

  const { favorites, favoriteRecipes, ratings, isLoading: favoritesLoading, toggleFavorite, rateRecipe } =
    useFavorites();

  const handleIngredientSubmit = (newIngredients: string[]) => {
    setIngredients(newIngredients);
  };

  const handleSearchClick = async () => {
    await handleSearch({
      ingredients,
      filters,
      dietaryPreferences,
      servings,
    });
  };

  const handleGenerateClick = async () => {
    await handleGenerate({
      ingredients,
      recognizedIngredients,
      filters,
      dietaryPreferences,
      servings,
    });
    await fetchSuggestions();
  };

  const handleClearAll = () => {
    setIngredients([]);
    setRecognizedIngredients([]);
    setDietaryPreferences([]);
    setServings(undefined);
    setSelectedMatch(null);
    handleClear();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Smart Recipe Generator</h1>
            <p className="text-sm text-slate-300">
              Generate personalized recipes from your pantry items and dietary preferences.
            </p>
          </div>
          <button
            className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-primary-500 hover:text-primary-400"
            onClick={() => setShowFavorites((prev) => !prev)}
            disabled={favoritesLoading}
          >
            {favoritesLoading
              ? "Loading favorites..."
              : showFavorites
              ? "Hide Favorites"
              : `Favorites (${favorites.length})`}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <div className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <IngredientInput
                ingredients={ingredients}
                onChange={handleIngredientSubmit}
                onClear={() => setIngredients([])}
                onSearch={handleSearchClick}
              />

              <ImageIngredientUploader onRecognized={setRecognizedIngredients} />

              {recognizedIngredients.length > 0 && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                  <p className="font-medium">Recognized ingredients</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {recognizedIngredients.map((ingredient) => (
                      <li
                        key={ingredient}
                        className="rounded-full border border-emerald-500/50 px-3 py-1 text-xs uppercase tracking-wide"
                      >
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <DietaryPreferences
                preferences={dietaryPreferences}
                onChange={setDietaryPreferences}
              />

              <FiltersPanel
                filters={filters}
                servings={servings}
                onFiltersChange={setFilters}
                onServingsChange={setServings}
              />

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleGenerateClick}
                  disabled={isLoading}
                  className={cn(
                    "rounded-full bg-primary-500 px-6 py-2 font-semibold text-white transition",
                    isLoading ? "cursor-not-allowed opacity-60" : "hover:bg-primary-400"
                  )}
                >
                    {isLoading ? "Generating..." : "Generate Recipes"}
                </button>
                <button
                  onClick={handleSearchClick}
                  disabled={isLoading}
                  className={cn(
                    "rounded-full border border-primary-500 px-6 py-2 font-semibold text-primary-300 transition",
                    isLoading ? "cursor-not-allowed opacity-60" : "hover:border-primary-400 hover:text-primary-200"
                  )}
                >
                    {isLoading ? "Searching..." : "Quick Search"}
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={isLoading}
                  className="rounded-full border border-slate-700 px-6 py-2 font-semibold text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
                >
                  Clear All
                </button>
              </div>

              {error && (
                <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
                  <p className="font-semibold">Something went wrong</p>
                  <p>{error}</p>
                </div>
              )}
            </div>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <header className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Recipe Matches</h2>
                <div className="text-sm text-slate-400">
                  {isLoading ? "Loading..." : `${results.matches.length ?? 0} results`}
                </div>
              </header>

              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {results.matches.map((match: RecipeMatchResult) => (
                  <RecipeCard
                    key={match.recipe.id}
                    match={match}
                    servings={servings ?? match.servings ?? match.recipe.baseServings}
                    isFavorite={favorites.includes(match.recipe.id)}
                    onToggleFavorite={() => toggleFavorite(match.recipe.id)}
                    initialRating={ratings[match.recipe.id] ?? 0}
                    onRate={(rating: number) => rateRecipe(match.recipe.id, rating)}
                    onViewDetails={() => setSelectedMatch(match)}
                  />
                ))}
              </div>

              {!isLoading && results.matches.length === 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 text-sm text-slate-300">
                  <p>No recipes match these ingredients yet. Try adding more pantry items or adjusting filters.</p>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <SuggestionsPanel
              matches={results.matches.slice(0, 4)}
              suggestions={suggestions}
              isLoading={suggestionsLoading}
              onRefresh={fetchSuggestions}
            />
            <FavoritesDrawer
              open={showFavorites}
              favorites={favoriteRecipes}
              onClose={() => setShowFavorites(false)}
            />
          </aside>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-slate-400">
          <p>
            Powered by a curated recipe dataset, optional AI ingredient recognition, and real-time personalization.
          </p>
        </div>
      </footer>
      <RecipeDetailsModal
        match={selectedMatch}
        servings={selectedMatch ? servings ?? selectedMatch.servings ?? selectedMatch.recipe.baseServings : 0}
        onClose={() => setSelectedMatch(null)}
      />
    </div>
  );
}

export default App;
