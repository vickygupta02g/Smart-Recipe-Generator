import express from "express";
import multer from "multer";
import { analyzeIngredientsFromImage, MissingTokenError } from "../services/ingredientService";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/analyze-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const predictions = await analyzeIngredientsFromImage(req.file.buffer);
    return res.json({ predictions });
  } catch (error) {
    if (error instanceof MissingTokenError) {
      return res.status(503).json({ message: error.message, requiresToken: true });
    }

    console.error("Image analysis error", error);
    return res.status(500).json({ message: "Unable to analyze image" });
  }
});

export default router;
