export type DifficultyLevel = "easy" | "medium" | "hard";

export type DietaryTag =
  | "vegetarian"
  | "vegan"
  | "gluten-free"
  | "dairy-free"
  | "nut-free"
  | "pescatarian"
  | "keto"
  | "halal"
  | "kosher";

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  preparation?: string;
  optional?: boolean;
}

export interface NutritionFacts {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

export interface SubstitutionSuggestion {
  ingredient: string;
  substitutes: string[];
  note?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  difficulty: DifficultyLevel;
  cookingTime: number; // minutes
  baseServings: number;
  dietaryTags: DietaryTag[];
  ingredients: Ingredient[];
  steps: string[];
  nutrition: NutritionFacts;
  image?: string;
  substitutionSuggestions: SubstitutionSuggestion[];
}

export interface RatedRecipe {
  recipeId: string;
  rating: number;
  ratedAt: string;
}

export interface FavoriteRecipe {
  recipeId: string;
  savedAt: string;
}

export interface UserPreferences {
  dietaryPreferences: DietaryTag[];
  dislikedIngredients: string[];
  favoriteCuisines: string[];
}

export interface UserData {
  ratings: RatedRecipe[];
  favorites: FavoriteRecipe[];
  preferences: UserPreferences;
}

export interface RecipeMatchResult {
  recipe: Recipe;
  score: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  substitutionOptions: SubstitutionSuggestion[];
  servings?: number;
  scaledIngredients?: Ingredient[];
  notes?: string[];
}

export interface RecipeSearchFilters {
  difficulty?: DifficultyLevel | "any";
  maxCookingTime?: number;
  dietaryRestrictions?: DietaryTag[];
}

export interface RecipeSearchPayload {
  ingredients: string[];
  filters?: RecipeSearchFilters;
  dietaryPreferences?: DietaryTag[];
  servings?: number;
}
