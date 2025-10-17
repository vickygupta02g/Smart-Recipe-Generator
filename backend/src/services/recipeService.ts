import recipesJson from "../../../data/recipes.json";
import {
  Ingredient,
  Recipe,
  RecipeMatchResult,
  RecipeSearchFilters,
  RecipeSearchPayload,
  SubstitutionSuggestion,
} from "../types";

const RECIPE_DATA: Recipe[] = recipesJson as unknown as Recipe[];

const ingredientNormalizer = new Intl.Collator("en", { sensitivity: "base" });

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function matchesDietaryRestrictions(
  recipe: Recipe,
  restrictions: RecipeSearchFilters["dietaryRestrictions"]
): boolean {
  if (!restrictions || restrictions.length === 0) {
    return true;
  }
  return restrictions.every((restriction) =>
    recipe.dietaryTags.map(normalize).includes(normalize(restriction))
  );
}

function filterByDifficulty(recipe: Recipe, difficulty?: RecipeSearchFilters["difficulty"]): boolean {
  if (!difficulty || difficulty === "any") return true;
  return recipe.difficulty === difficulty;
}

function filterByCookingTime(recipe: Recipe, maxCookingTime?: number): boolean {
  if (!maxCookingTime) return true;
  return recipe.cookingTime <= maxCookingTime;
}

function computeMatchScore(
  recipe: Recipe,
  ingredients: string[],
  dietaryPreferences: string[] | undefined
): { score: number; matchedIngredients: string[]; missingIngredients: string[] } {
  const normalizedInput = ingredients.map(normalize);
  const recipeIngredients = recipe.ingredients.map((item) => normalize(item.name));

  const matchedIngredients = recipeIngredients.filter((ingredient) =>
    normalizedInput.some((inputIngredient) =>
      ingredientNormalizer.compare(inputIngredient, ingredient) === 0 ||
      ingredient.includes(inputIngredient) ||
      inputIngredient.includes(ingredient)
    )
  );

  const missingIngredients = recipeIngredients.filter(
    (ingredient) => !matchedIngredients.includes(ingredient)
  );

  const baseScore = matchedIngredients.length / recipeIngredients.length;

  const dietaryBonus = dietaryPreferences?.some((pref) =>
    recipe.dietaryTags.includes(pref as any)
  )
    ? 0.05
    : 0;

  const score = Math.max(0, Math.min(1, baseScore + dietaryBonus));

  return { score, matchedIngredients, missingIngredients };
}

function getSubstitutions(
  recipe: Recipe,
  missingIngredients: string[]
): SubstitutionSuggestion[] {
  if (missingIngredients.length === 0) return [];
  return recipe.substitutionSuggestions.filter((suggestion) =>
    missingIngredients.includes(normalize(suggestion.ingredient))
  );
}

function scaleIngredients(recipe: Recipe, servings?: number): Ingredient[] | undefined {
  if (!servings || servings === recipe.baseServings) {
    return undefined;
  }

  const factor = servings / recipe.baseServings;
  return recipe.ingredients.map((ingredient) => ({
    ...ingredient,
    quantity: Math.round((ingredient.quantity * factor + Number.EPSILON) * 100) / 100,
  }));
}

function buildNotes(missingIngredients: string[], substitutionOptions: SubstitutionSuggestion[]): string[] {
  const notes: string[] = [];
  if (missingIngredients.length > 0) {
    notes.push(`Missing ${missingIngredients.length} ingredients: ${missingIngredients.join(", ")}.`);
  }
  if (substitutionOptions.length > 0) {
    notes.push("Try suggested substitutions to complete this recipe.");
  }
  return notes;
}

export function getAllRecipes(): Recipe[] {
  return RECIPE_DATA;
}

export function getRecipeById(id: string): Recipe | undefined {
  return RECIPE_DATA.find((recipe) => recipe.id === id);
}

export function searchRecipes(payload: RecipeSearchPayload): RecipeMatchResult[] {
  const { ingredients, filters, dietaryPreferences, servings } = payload;
  const normalizedIngredients = Array.from(new Set(ingredients.map(normalize)));

  return RECIPE_DATA.filter((recipe) =>
    matchesDietaryRestrictions(recipe, filters?.dietaryRestrictions) &&
    filterByDifficulty(recipe, filters?.difficulty) &&
    filterByCookingTime(recipe, filters?.maxCookingTime)
  )
    .map((recipe) => {
      const { score, matchedIngredients, missingIngredients } = computeMatchScore(
        recipe,
        normalizedIngredients,
        dietaryPreferences
      );

      const substitutionOptions = getSubstitutions(recipe, missingIngredients);
      const scaledIngredients = scaleIngredients(recipe, servings);
      const notes = buildNotes(missingIngredients, substitutionOptions);

      const result: RecipeMatchResult = {
        recipe,
        score,
        matchedIngredients,
        missingIngredients,
        substitutionOptions,
      };

      if (servings) {
        result.servings = servings;
      }

      if (scaledIngredients) {
        result.scaledIngredients = scaledIngredients;
      }

      if (notes.length > 0) {
        result.notes = notes;
      }

      return result;
    })
    .filter((result) => result.score > 0.1)
    .sort((a, b) => b.score - a.score);
}
