import { useCallback, useEffect, useMemo, useState } from "react";
import { endpoints } from "../config";
import { http } from "../services/http";
import type { FavoriteRecipe, RatedRecipe, Recipe } from "../types/api";

interface UseFavoritesResult {
  favorites: string[];
  favoriteRecipes: Recipe[];
  ratings: Record<string, number>;
  isLoading: boolean;
  toggleFavorite: (recipeId: string) => Promise<void>;
  rateRecipe: (recipeId: string, rating: number) => Promise<void>;
}

export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [catalog, setCatalog] = useState<Record<string, Recipe>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const [recipes, favoriteEntries, ratingEntries] = await Promise.all([
          http<Recipe[]>(endpoints.recipes),
          http<FavoriteRecipe[]>(`${endpoints.user}/favorites`),
          http<RatedRecipe[]>(`${endpoints.user}/ratings`),
        ]);

        const recipeMap = recipes.reduce<Record<string, Recipe>>((acc, recipe) => {
          acc[recipe.id] = recipe;
          return acc;
        }, {});

        setCatalog(recipeMap);
        setFavorites(favoriteEntries.map((entry) => entry.recipeId));
        setRatings(
          ratingEntries.reduce<Record<string, number>>((acc, entry) => {
            acc[entry.recipeId] = entry.rating;
            return acc;
          }, {})
        );
      } catch (error) {
        console.error("Failed to load favorites", error);
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, []);

  const toggleFavorite = useCallback(async (recipeId: string) => {
    try {
      const updated = await http<FavoriteRecipe[]>(`${endpoints.user}/favorites/${recipeId}`, {
        method: "POST",
      });
      setFavorites(updated.map((entry) => entry.recipeId));
    } catch (error) {
      console.error("Failed to update favorite", error);
    }
  }, []);

  const rateRecipe = useCallback(async (recipeId: string, rating: number) => {
    try {
      const updated = await http<RatedRecipe[]>(`${endpoints.user}/ratings`, {
        method: "POST",
        body: JSON.stringify({ recipeId, rating }),
      });
      setRatings(
        updated.reduce<Record<string, number>>((acc, entry) => {
          acc[entry.recipeId] = entry.rating;
          return acc;
        }, {})
      );
    } catch (error) {
      console.error("Failed to rate recipe", error);
    }
  }, []);

  const favoriteRecipes = useMemo(
    () => favorites.map((id) => catalog[id]).filter(Boolean),
    [favorites, catalog]
  );

  return {
    favorites,
    favoriteRecipes,
    ratings,
    isLoading,
    toggleFavorite,
    rateRecipe,
  };
}
