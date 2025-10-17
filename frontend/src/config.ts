const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export const endpoints = {
  recipes: `${API_BASE_URL}/api/recipes`,
  generate: `${API_BASE_URL}/api/recipes/generate`,
  ingredients: `${API_BASE_URL}/api/ingredients`,
  user: `${API_BASE_URL}/api/user`,
};
