import express from "express";
import { z } from "zod";
import {
  getUserData,
  rateRecipe,
  toggleFavorite,
  updateUserPreferences,
  getPersonalizedSuggestions,
} from "../services/suggestionService";
import type { UserPreferences } from "../types";

const router = express.Router();

const RatingSchema = z.object({
  recipeId: z.string().min(1),
  rating: z.number().min(1).max(5),
});

const PreferencesSchema = z.object({
  dietaryPreferences: z.array(z.string()).optional(),
  dislikedIngredients: z.array(z.string()).optional(),
  favoriteCuisines: z.array(z.string()).optional(),
});

router.get("/preferences", async (_req, res) => {
  const data = await getUserData();
  res.json(data.preferences);
});

router.put("/preferences", async (req, res) => {
  const parsed = PreferencesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.flatten() });
  }

  const updated = await updateUserPreferences(parsed.data as Partial<UserPreferences>);
  res.json(updated.preferences);
});

router.get("/favorites", async (_req, res) => {
  const data = await getUserData();
  res.json(data.favorites);
});

router.post("/favorites/:id", async (req, res) => {
  const { id } = req.params;
  const updated = await toggleFavorite(id);
  res.json(updated.favorites);
});

router.get("/ratings", async (_req, res) => {
  const data = await getUserData();
  res.json(data.ratings);
});

router.post("/ratings", async (req, res) => {
  const parsed = RatingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.flatten() });
  }

  const updated = await rateRecipe(parsed.data.recipeId, parsed.data.rating);
  res.json(updated.ratings);
});

router.get("/suggestions", async (_req, res) => {
  const suggestions = await getPersonalizedSuggestions();
  res.json(suggestions);
});

export default router;
