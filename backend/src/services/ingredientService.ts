import { config } from "../config";

export interface IngredientPrediction {
  label: string;
  confidence: number;
}

const HUGGING_FACE_MODEL = "nateraw/food";
const HUGGING_FACE_URL = `https://api-inference.huggingface.co/models/${HUGGING_FACE_MODEL}`;

export class MissingTokenError extends Error {
  constructor() {
    super(
      "HF_API_TOKEN is not configured. Set it in the backend .env file to enable image ingredient recognition."
    );
    this.name = "MissingTokenError";
  }
}

export async function analyzeIngredientsFromImage(
  fileBuffer: Buffer
): Promise<IngredientPrediction[]> {
  if (!config.huggingFaceToken) {
    throw new MissingTokenError();
  }

  const response = await fetch(HUGGING_FACE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.huggingFaceToken}`,
      "Content-Type": "application/octet-stream",
    },
    body: fileBuffer,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Hugging Face request failed: ${response.status} ${errorBody}`);
  }

  const predictions = (await response.json()) as Array<{
    label: string;
    score: number;
  }>;

  return predictions
    .map((prediction) => ({
      label: prediction.label,
      confidence: prediction.score,
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}
