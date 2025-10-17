import { useEffect } from "react";
import type { Ingredient, RecipeMatchResult } from "../types/api";

interface RecipeDetailsModalProps {
  match: RecipeMatchResult | null;
  servings: number;
  onClose: () => void;
}

function formatIngredient(ingredient: Ingredient) {
  const { name, quantity, unit, preparation } = ingredient;
  const amount = Number.isInteger(quantity) ? quantity : quantity.toFixed(2);
  const parts = [String(amount)];
  if (unit) {
    parts.push(unit);
  }
  parts.push(name);
  if (preparation) {
    parts.push(`(${preparation})`);
  }
  return parts.join(" ");
}

export function RecipeDetailsModal({ match, servings, onClose }: RecipeDetailsModalProps) {
  if (!match) {
    return null;
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const baseIngredients = match.scaledIngredients ?? match.recipe.ingredients;
  const ingredientList = baseIngredients.map(formatIngredient);
  const recipeSubstitutions = match.substitutionOptions.length
    ? match.substitutionOptions
    : match.recipe.substitutionSuggestions;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/70 px-4 py-8 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-3xl overflow-y-auto rounded-2xl bg-slate-900 shadow-2xl ring-1 ring-slate-700"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-primary-300">Detailed Recipe</p>
            <h2 id="recipe-modal-title" className="mt-1 text-2xl font-bold text-slate-100">
              {match.recipe.title}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Serves {servings} - Difficulty: {match.recipe.difficulty} - Cook time: {match.recipe.cookingTime} min
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-300 transition hover:bg-slate-800 hover:text-slate-100"
            aria-label="Close recipe details"
          >
            X
          </button>
        </header>

        <div className="space-y-8 px-6 py-6 text-sm text-slate-200">
          <section>
            <h3 className="text-base font-semibold text-slate-100">Ingredients</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {ingredientList.map((entry) => (
                <li key={entry} className="text-slate-200">
                  {entry}
                </li>
              ))}
            </ul>
          </section>

          {match.notes && match.notes.length > 0 && (
            <section>
              <h3 className="text-base font-semibold text-slate-100">Notes</h3>
              <ul className="mt-3 space-y-2">
                {match.notes.map((note) => (
                  <li key={note} className="rounded-lg bg-slate-800/60 px-3 py-2">
                    {note}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {recipeSubstitutions.length > 0 && (
            <section>
              <h3 className="text-base font-semibold text-slate-100">Substitutions</h3>
              <ul className="mt-3 space-y-2">
                {recipeSubstitutions.map((option) => (
                  <li key={option.ingredient} className="rounded-lg bg-slate-800/60 px-3 py-2">
                    <span className="font-medium text-primary-200">{option.ingredient}:</span> {option.substitutes.join(", ")}
                    {option.note ? <span className="block text-xs text-slate-300">{option.note}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="text-base font-semibold text-slate-100">Instructions</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              {match.recipe.steps.map((step, index) => (
                <li key={`${index}-${step.slice(0, 16)}`} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          </section>

          {match.recipe.nutrition && (
            <section>
              <h3 className="text-base font-semibold text-slate-100">Nutrition (per serving)</h3>
              <ul className="mt-3 grid grid-cols-2 gap-3 text-sm">
                {Object.entries(match.recipe.nutrition).map(([label, value]) => (
                  <li key={label} className="rounded-lg bg-slate-800/60 px-3 py-2">
                    <span className="font-medium text-primary-200">{label}:</span> {String(value)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(match.missingIngredients?.length ?? 0) > 0 && (
            <section>
              <h3 className="text-base font-semibold text-slate-100">Missing Ingredients</h3>
              <p className="mt-3 text-slate-300">
                {match.missingIngredients?.join(', ')}
              </p>
            </section>
          )}
        </div>

        <footer className="flex justify-end border-t border-slate-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-primary-400"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
