import cors from "cors";
import express from "express";
import path from "path";
import recipesRouter from "./routes/recipes";
import ingredientsRouter from "./routes/ingredients";
import userRouter from "./routes/user";
import { config } from "./config";

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/recipes", recipesRouter);
app.use("/api/ingredients", ingredientsRouter);
app.use("/api/user", userRouter);

// Serve recipe images if provided
app.use(
  "/images",
  express.static(path.resolve(__dirname, "../public/images"), {
    fallthrough: true,
  })
);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unexpected server error", err);
  res.status(500).json({ message: "An unexpected error occurred" });
});

app.listen(config.port, () => {
  console.log(`Smart Recipe Generator backend listening on port ${config.port}`);
});
