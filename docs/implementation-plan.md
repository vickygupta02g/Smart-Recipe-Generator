# Smart Recipe Generator Implementation Plan

## Backend
- Set up Express server with TypeScript, CORS, JSON parsing, and global error handling.
- Implement `/api/recipes/search` to rank recipes by ingredient overlap, dietary fit, difficulty, and cooking time filters.
- Implement `/api/recipes/generate` wrapper that combines ingredient list with optional AI ingredient recognition results and returns top matches with missing ingredient guidance and substitution ideas.
- Implement `/api/ingredients/analyze` file-upload endpoint that proxies to Hugging Face Inference API (requires `HF_API_TOKEN`) with graceful fallback messaging.
- Build `/api/recipes/:id/rate`, `/api/user/favorites`, and `/api/user/preferences` endpoints storing data in JSON files under `data/` using a small persistence helper.
- Provide `/api/recipes/suggestions` that personalizes results based on saved favorites/ratings and dietary preferences.
- Prepare recipe dataset of ≥20 entries with ingredients, substitutions, nutrition facts, and metadata stored under `data/recipes.json`.

## Frontend
- Convert Vite app to React + TypeScript with Tailwind CSS for responsive UI.
- Build pages/components: `IngredientForm`, `ImageUploader`, `FilterPanel`, `RecipeResults`, `RecipeDetailsModal`, `SuggestionsPanel`, `FavoritesDrawer`.
- Create service layer for API calls with error handling and loading indicators.
- Support ingredient text input, tagged ingredient chips, and dietary preference toggles.
- Enable image upload to call backend ingredient recognition and merge with manual inputs.
- Implement filter controls (difficulty, cook time range, dietary). Tie into API request payloads.
- Allow recipes to adjust serving size with scaled ingredient quantities client-side.
- Provide rating/favorite interactions connected to backend endpoints and persistent local fallback if backend offline.
- Add substitution suggestions and nutritional information display inside recipe cards/modal.
- Ensure layout is mobile-first with accessible components and skeleton loaders.

## DevOps & Documentation
- Supply `.env.example` for backend (Hugging Face token, port) and frontend (API base URL).
- Add npm scripts for build/start/test flows. Configure Tailwind, ESLint (optional) and Prettier (optional) if time allows.
- Document setup, environment variables, deployment steps (Vercel/Render/Netlify) in root `README.md` plus 200-word approach summary.
- Provide sample `tasks.json` if useful for running both servers during development.
