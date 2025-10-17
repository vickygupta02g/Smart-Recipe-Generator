import { JsonDataStore } from "../utils/dataStore";
import {
  FavoriteRecipe,
  RatedRecipe,
  Recipe,
  RecipeMatchResult,
  UserData,
  UserPreferences,
} from "../types";
import { getAllRecipes } from "./recipeService";

const userStore = new JsonDataStore<UserData>("data/user-data.json", {
  ratings: [],
  favorites: [],
  preferences: {
    dietaryPreferences: [],
    dislikedIngredients: [],
    favoriteCuisines: [],
  },
});

export async function getUserData(): Promise<UserData> {
  return userStore.get();
}

export async function updateUserPreferences(
  incomingPreferences: Partial<UserPreferences>
): Promise<UserData> {
  const current = await userStore.get();
  const updated: UserData = {
    ...current,
    preferences: {
      ...current.preferences,
      ...incomingPreferences,
      dietaryPreferences: incomingPreferences.dietaryPreferences ?? current.preferences.dietaryPreferences,
      dislikedIngredients: incomingPreferences.dislikedIngredients ?? current.preferences.dislikedIngredients,
      favoriteCuisines: incomingPreferences.favoriteCuisines ?? current.preferences.favoriteCuisines,
    },
  };
  await userStore.set(updated);
  return updated;
}

export async function toggleFavorite(recipeId: string): Promise<UserData> {
  const current = await userStore.get();
  const exists = current.favorites.find((favorite) => favorite.recipeId === recipeId);
  const favorites: FavoriteRecipe[] = exists
    ? current.favorites.filter((favorite) => favorite.recipeId !== recipeId)
    : [
        ...current.favorites,
        { recipeId, savedAt: new Date().toISOString() },
      ];
  const updated: UserData = { ...current, favorites };
  await userStore.set(updated);
  return updated;
}

export async function rateRecipe(recipeId: string, rating: number): Promise<UserData> {
  const current = await userStore.get();
  const sanitizedRating = Math.min(5, Math.max(1, rating));
  const existingIndex = current.ratings.findIndex((item) => item.recipeId === recipeId);
  let ratings: RatedRecipe[];
  if (existingIndex >= 0) {
    ratings = current.ratings.map((item) =>
      item.recipeId === recipeId
        ? { recipeId, rating: sanitizedRating, ratedAt: new Date().toISOString() }
        : item
    );
  } else {
    ratings = [
      ...current.ratings,
      { recipeId, rating: sanitizedRating, ratedAt: new Date().toISOString() },
    ];
  }
  const updated: UserData = { ...current, ratings };
  await userStore.set(updated);
  return updated;
}

export async function getPersonalizedSuggestions(): Promise<RecipeMatchResult[]> {
  const userData = await userStore.get();
  const recipes = getAllRecipes();

  if (userData.favorites.length === 0 && userData.ratings.length === 0) {
    return recipes.slice(0, 5).map((recipe) => ({
      recipe,
      score: 0.3,
      matchedIngredients: [],
      missingIngredients: [],
      substitutionOptions: [],
    }));
  }

  const favoriteIds = new Set(userData.favorites.map((fav) => fav.recipeId));
  const topRatedIds = userData.ratings
    .filter((rating) => rating.rating >= 4)
    .map((rating) => rating.recipeId);

  const preferredCuisines = new Set(userData.preferences.favoriteCuisines.map((cuisine) => cuisine.toLowerCase()));
  const preferredDietary = new Set(userData.preferences.dietaryPreferences);

  const scored = recipes.map((recipe) => {
    let score = 0;
    if (favoriteIds.has(recipe.id)) score += 0.6;
    if (topRatedIds.includes(recipe.id)) score += 0.4;
    if (preferredCuisines.has(recipe.cuisine.toLowerCase())) score += 0.2;
    if (recipe.dietaryTags.some((tag) => preferredDietary.has(tag))) score += 0.1;
    return { recipe, score };
  });

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((entry) => ({
      recipe: entry.recipe,
      score: entry.score,
      matchedIngredients: [],
      missingIngredients: [],
      substitutionOptions: [],
    }));
}
