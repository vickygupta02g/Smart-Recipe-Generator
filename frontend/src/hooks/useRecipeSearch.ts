import { useCallback, useMemo, useState } from "react";
import { endpoints } from "../config";
import { http } from "../services/http";
import type {
  RecipeMatchResult,
  RecipeSearchFilters,
  RecipeSearchPayload,
  RecipeSearchResponse,
} from "../types/api";

export interface SearchOptions {
  ingredients: string[];
  filters?: {
    difficulty?: string;
    maxCookingTime?: number;
    dietaryRestrictions?: string[];
  };
  dietaryPreferences?: string[];
  servings?: number;
  recognizedIngredients?: string[];
}

interface UseRecipeSearchResult {
  results: Required<RecipeSearchResponse>;
  isLoading: boolean;
  error: string | null;
  handleSearch: (options: SearchOptions) => Promise<void>;
  handleGenerate: (options: SearchOptions) => Promise<void>;
  handleClear: () => void;
}

const DEFAULT_RESULTS: Required<RecipeSearchResponse> = {
  matches: [],
  suggestions: [],
};

function normalizeStrings(values?: string[]): string[] | undefined {
  if (!values) return undefined;
  const normalized = Array.from(
    new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean))
  );
  return normalized.length > 0 ? normalized : undefined;
}

export function useRecipeSearch(): UseRecipeSearchResult {
  const [results, setResults] = useState(DEFAULT_RESULTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildPayload = useCallback(
    (options: SearchOptions, includeSuggestions = false): RecipeSearchPayload => {
      const dietaryPreferences = normalizeStrings(options.dietaryPreferences) as RecipeSearchPayload["dietaryPreferences"];
      const ingredients = normalizeStrings(options.ingredients) ?? [];
      const recognized = normalizeStrings(options.recognizedIngredients);
      const filterPayload: RecipeSearchFilters = {};

      if (options.filters?.difficulty && options.filters.difficulty !== "any") {
        filterPayload.difficulty = options.filters.difficulty as RecipeSearchFilters["difficulty"];
      }

      if (typeof options.filters?.maxCookingTime === "number") {
        filterPayload.maxCookingTime = options.filters.maxCookingTime;
      }

      const dietRestrictions = normalizeStrings(options.filters?.dietaryRestrictions) as
        | RecipeSearchFilters["dietaryRestrictions"]
        | undefined;

      if (dietRestrictions) {
        filterPayload.dietaryRestrictions = dietRestrictions;
      }

      return {
        ingredients,
        ...(Object.keys(filterPayload).length ? { filters: filterPayload } : {}),
        ...(dietaryPreferences ? { dietaryPreferences } : {}),
        ...(options.servings ? { servings: options.servings } : {}),
        ...(recognized ? { recognizedIngredients: recognized } : {}),
        ...(includeSuggestions ? { includeSuggestions: true } : {}),
      };
    },
    []
  );

  const handleRequest = useCallback(
    async (path: string, options: SearchOptions, includeSuggestions = false) => {
      setIsLoading(true);
      setError(null);
      try {
        const payload = buildPayload(options, includeSuggestions);
        const data = await http<RecipeSearchResponse | RecipeMatchResult[]>(path, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const normalizedResults: Required<RecipeSearchResponse> = Array.isArray(data)
          ? { matches: data, suggestions: [] }
          : {
              matches: data.matches ?? [],
              suggestions: data.suggestions ?? [],
            };

        setResults(normalizedResults);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    [buildPayload]
  );

  const handleSearch = useCallback(
    async (options: SearchOptions) => {
      await handleRequest(`${endpoints.recipes}/search`, options, false);
    },
    [handleRequest]
  );

  const handleGenerate = useCallback(
    async (options: SearchOptions) => {
      await handleRequest(endpoints.generate, options, true);
    },
    [handleRequest]
  );

  const handleClear = useCallback(() => {
    setResults(DEFAULT_RESULTS);
    setError(null);
  }, []);

  return useMemo(
    () => ({ results, isLoading, error, handleSearch, handleGenerate, handleClear }),
    [results, isLoading, error, handleSearch, handleGenerate, handleClear]
  );
}
