# Smart Recipe Generator

The Smart Recipe Generator turns pantry ingredients and dietary preferences into tailored recipe ideas. It pairs a React + Vite frontend with a TypeScript Express backend and a curated dataset of 20+ recipes, optional AI-powered image recognition, and persistent user personalization.

## Live Demo

- Production build: [smart-recipe-generator-vicky.vercel.app](https://smart-recipe-generator-vicky.vercel.app)

## Features

- Ingredient-based recipe search with filters for difficulty, cook time, and dietary restrictions.
- Optional AI ingredient recognition via Hugging Face image inference.
- Smart suggestions informed by saved favorites and past ratings.
- Favorites drawer for quick access and JSON-backed user persistence.
- Responsive, accessible UI built with Tailwind CSS and modern React patterns (hooks, TypeScript).

## Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS.
- **Backend:** Express 5, TypeScript, Zod validation, fs-extra datastore.
- **AI Integration:** Hugging Face Inference API (optional).
- **Tooling:** npm, ts-node-dev, @vitejs/plugin-react.

## Project Structure

```
Smart-Recipe-Generator/
├── backend/               # Express API (src/, data store helpers, routes)
├── frontend/              # React UI (components, hooks, styles)
├── data/                  # recipes.json and user-data.json
├── docs/                  # supplementary documentation (optional)
├── .github/               # Copilot instructions and workflows
└── README.md
```

## Prerequisites

- **Node.js** ≥ 22.12.0 (or Node 20.19 LTS). Earlier 22.x builds (e.g., 22.9.0) ship with outdated TLS roots and may fail against Hugging Face HTTPS endpoints.
- **npm** ≥ 10 (bundled with the Node versions above).
- (Optional) A Hugging Face access token for image ingredient recognition.

## Environment Variables

Create `.env` files in both `frontend/` and `backend/` as needed. Samples are provided in each package.

### Frontend (`frontend/.env`)

```
VITE_API_BASE_URL=http://localhost:4000
```

### Backend (`backend/.env`)

```
PORT=4000
HF_API_TOKEN=your-huggingface-token   # optional; enables image recognition
```

If `HF_API_TOKEN` is omitted, the backend gracefully disables image analysis and surfaces a helpful error to the UI.

## Installation

From the repository root:

```powershell
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

Return to the repository root when finished.

## Running Locally

1. **Backend API**
   ```powershell
   cd backend
   npm run dev
   ```
   The API starts on `http://localhost:4000` and watches for TypeScript changes.

2. **Frontend UI**
   ```powershell
   cd ../frontend
   npm run dev
   ```
   Vite serves the React app on `http://localhost:5173` with hot-module reloading. Confirm `VITE_API_BASE_URL` points at the backend URL.

3. Open the frontend in your browser and begin entering ingredients or uploading an image.

## Building for Production

```powershell
# Backend build artifacts (outputs to backend/dist)
cd backend
npm run build

# Frontend static build (outputs to frontend/dist)
cd ../frontend
npm run build
```

You can deploy the bundled frontend to any static host and run the backend on a Node-compatible platform (e.g., render.com, Railway, Azure App Service).

## Available npm Scripts

| Location  | Script          | Description                                  |
|-----------|-----------------|----------------------------------------------|
| backend   | `npm run dev`   | Start Express with ts-node-dev hot reload.   |
| backend   | `npm run build` | Type-check and emit JS to `dist/`.           |
| backend   | `npm start`     | Run the compiled server from `dist/`.        |
| frontend  | `npm run dev`   | Launch Vite dev server with HMR.             |
| frontend  | `npm run build` | Type-check (`tsc`) then build production app |
| frontend  | `npm run preview` | Preview the production build locally.     |

## API Overview

- `POST /api/recipes/search` – ingredient-based search with optional filters.
- `POST /api/recipes/generate` – combines typed and recognized ingredients and can return suggestions.
- `GET /api/recipes/:id` – fetch a single recipe definition.
- `POST /api/ingredients/analyze` – proxy to Hugging Face for ingredient recognition (requires token).
- `GET/PUT /api/user/preferences` – user dietary settings.
- `POST /api/user/favorites` – toggle favorites.
- `POST /api/user/ratings` – save ratings.

All requests and responses are typed with Zod on the backend and TypeScript interfaces on the frontend (`frontend/src/types/api.ts`).

## Troubleshooting

- **Hugging Face TLS errors (`CERT_HAS_EXPIRED`)**: upgrade Node to 22.12+ or 20.19 LTS so the embedded OpenSSL root store trusts Hugging Face certificates.
- **Environment variables missing**: ensure `.env` files exist and restart the dev servers after editing them.
- **Tailwind classes not applying**: Vite must load `src/styles/index.css` via `src/main.tsx`. Confirm the import is present and the dev server restarted.

## Contributing

1. Fork the repo and create a feature branch (`git checkout -b feature/amazing-feature`).
2. Follow the setup instructions above.
3. Keep new code typed, linted, and documented.
4. Open a Pull Request describing the change and any testing performed.

## License

This project is licensed for educational and portfolio use. See individual files for additional notices. For commercial usage or derivative work, please contact the maintainers.
