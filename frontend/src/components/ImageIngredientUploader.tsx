import { useRef, useState } from "react";
import { endpoints } from "../config";

interface ImageIngredientUploaderProps {
  onRecognized: (ingredients: string[]) => void;
}

interface PredictionResponse {
  predictions: Array<{ label: string; confidence: number }>;
  message?: string;
  requiresToken?: boolean;
}

export function ImageIngredientUploader({ onRecognized }: ImageIngredientUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setInfo(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${endpoints.ingredients}/analyze-image`, {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as PredictionResponse;

      if (!response.ok) {
        setError(data.message ?? "Unable to analyze image");
        if (data.requiresToken) {
          setInfo("Configure HF_API_TOKEN on the backend to enable ingredient recognition.");
        }
        return;
      }

      const recognized = data.predictions
        .filter((prediction) => prediction.confidence >= 0.2)
        .map((prediction) => prediction.label.toLowerCase());

      onRecognized(recognized);
      if (recognized.length === 0) {
        setInfo("No confident ingredients detected. Try another photo or add manually.");
      } else {
        setInfo(`Recognized ${recognized.length} ingredient${recognized.length > 1 ? "s" : ""}.`);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Ingredient image recognition</h3>
          <p className="text-xs text-slate-400">
            Snap a photo of your ingredients to auto-detect pantry items.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-primary-500 hover:text-primary-300"
          disabled={isLoading}
        >
          {isLoading ? "Analyzing..." : "Upload"}
        </button>
      </header>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label="Upload ingredient photo"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleUpload(file);
          }
        }}
      />

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
          {error}
        </div>
      )}

      {info && !error && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-xs text-emerald-200">
          {info}
        </div>
      )}
    </section>
  );
}
