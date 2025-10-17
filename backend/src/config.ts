import dotenv from "dotenv";

dotenv.config();

function getNumber(key: string, fallback: number): number {
  const raw = process.env[key];
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  port: getNumber("PORT", 4000),
  huggingFaceToken: process.env.HF_API_TOKEN ?? "",
};
