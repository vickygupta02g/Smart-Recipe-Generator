import express from "express";
import { z } from "zod";
import { getRecipeById, getAllRecipes, searchRecipes } from "../services/recipeService";
import { getPersonalizedSuggestions } from "../services/suggestionService";
import type { DietaryTag } from "../types";

const router = express.Router();

const RecipeSearchSchema = z.object({
  ingredients: z.array(z.string().min(1)).min(1),
  filters: z
    .object({
      difficulty: z.enum(["easy", "medium", "hard", "any"]).optional(),
      maxCookingTime: z.number().min(1).optional(),
      dietaryRestrictions: z.array(z.string()).optional(),
    })
    .optional(),
  dietaryPreferences: z.array(z.string()).optional(),
  servings: z.number().min(1).max(16).optional(),
  includeSuggestions: z.boolean().optional(),
  recognizedIngredients: z.array(z.string()).optional(),
});

const ALLOWED_DIETARY_TAGS: DietaryTag[] = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "pescatarian",
  "keto",
  "halal",
  "kosher",
];

const DIETARY_SET = new Set(ALLOWED_DIETARY_TAGS);

function sanitizeDietaryRestrictions(values?: string[]): DietaryTag[] | undefined {
  if (!values) return undefined;
  const filtered = values
    .map((value) => value.toLowerCase().trim())
    .filter((value): value is DietaryTag => DIETARY_SET.has(value as DietaryTag));
  return filtered.length > 0 ? filtered : undefined;
}

router.get("/", (_req, res) => {
  res.json(getAllRecipes());
});

router.get("/:id", (req, res) => {
  const recipe = getRecipeById(req.params.id);
  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found" });
  }
  return res.json(recipe);
});

router.post("/search", (req, res) => {
  const parseResult = RecipeSearchSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Invalid request", issues: parseResult.error.flatten() });
  }

  const {
    filters,
    includeSuggestions: _include,
    recognizedIngredients: _reco,
    dietaryPreferences,
    servings,
    ...payloadBase
  } = parseResult.data;
  const dietaryRestrictions = sanitizeDietaryRestrictions(filters?.dietaryRestrictions);
  const sanitizedFilters = filters
    ? {
        ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
        ...(typeof filters.maxCookingTime === "number" ? { maxCookingTime: filters.maxCookingTime } : {}),
        ...(dietaryRestrictions ? { dietaryRestrictions } : {}),
      }
    : undefined;
  const sanitizedDietaryPreferences = sanitizeDietaryRestrictions(dietaryPreferences);
  const matches = searchRecipes({
    ...payloadBase,
    ...(typeof servings === "number" ? { servings } : {}),
    ...(sanitizedFilters ? { filters: sanitizedFilters } : {}),
    ...(sanitizedDietaryPreferences ? { dietaryPreferences: sanitizedDietaryPreferences } : {}),
  });
  return res.json(matches);
});

router.post("/generate", async (req, res) => {
  const parseResult = RecipeSearchSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Invalid request", issues: parseResult.error.flatten() });
  }

  const {
    ingredients,
    recognizedIngredients,
    includeSuggestions,
    filters,
    dietaryPreferences,
    servings,
    ...rest
  } = parseResult.data;

  const combinedIngredients = Array.from(
    new Set([...(ingredients ?? []), ...(recognizedIngredients ?? [])])
  );

  if (combinedIngredients.length === 0) {
    return res.status(400).json({ message: "No ingredients provided" });
  }

  const dietaryRestrictions = sanitizeDietaryRestrictions(filters?.dietaryRestrictions);
  const sanitizedFilters = filters
    ? {
        ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
        ...(typeof filters.maxCookingTime === "number" ? { maxCookingTime: filters.maxCookingTime } : {}),
        ...(dietaryRestrictions ? { dietaryRestrictions } : {}),
      }
    : undefined;
  const sanitizedDietaryPreferences = sanitizeDietaryRestrictions(dietaryPreferences);

  const matches = searchRecipes({
    ...rest,
    ingredients: combinedIngredients,
    ...(typeof servings === "number" ? { servings } : {}),
    ...(sanitizedFilters ? { filters: sanitizedFilters } : {}),
    ...(sanitizedDietaryPreferences ? { dietaryPreferences: sanitizedDietaryPreferences } : {}),
  });

  if (!includeSuggestions) {
    return res.json({ matches });
  }

  const suggestions = await getPersonalizedSuggestions();
  return res.json({ matches, suggestions });
});

export default router;
