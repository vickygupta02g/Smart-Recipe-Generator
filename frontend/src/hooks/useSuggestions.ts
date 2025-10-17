import { useCallback, useState } from "react";
import { endpoints } from "../config";
import { http } from "../services/http";
import type { RecipeMatchResult } from "../types/api";

interface UseSuggestionsResult {
  suggestions: RecipeMatchResult[];
  isLoading: boolean;
  error: string | null;
  fetchSuggestions: () => Promise<void>;
}

export function useSuggestions(): UseSuggestionsResult {
  const [suggestions, setSuggestions] = useState<RecipeMatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await http<RecipeMatchResult[]>(`${endpoints.user}/suggestions`, {
        method: "GET",
      });
      setSuggestions(response);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load suggestions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
  };
}
