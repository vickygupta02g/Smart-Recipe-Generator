import type { FormEvent } from "react";
import { useState } from "react";
import { cn } from "../utils/cn";

interface IngredientInputProps {
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
  onClear: () => void;
  onSearch: () => Promise<void> | void;
}

export function IngredientInput({ ingredients, onChange, onClear, onSearch }: IngredientInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return;
    if (ingredients.includes(trimmed)) {
      setValue("");
      return;
    }
    onChange([...ingredients, trimmed]);
    setValue("");
  };

  const handleRemove = (ingredient: string) => {
    onChange(ingredients.filter((item) => item !== ingredient));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex w-full flex-wrap gap-3">
        <input
          type="text"
          value={value}
          placeholder="Add an ingredient (e.g. tomato, rice)"
          onChange={(event) => setValue(event.target.value)}
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
        />
        <button
          type="submit"
          className={cn(
            "rounded-xl border border-primary-500 px-4 py-3 text-sm font-medium text-primary-200 transition",
            "hover:border-primary-400 hover:text-primary-100"
          )}
        >
          Add
        </button>
        <button
          type="button"
          onClick={async () => {
            if (ingredients.length === 0) return;
            await onSearch();
          }}
          className="rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-400"
        >
          Use These
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
        >
          Clear
        </button>
      </form>

      {ingredients.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Current pantry items</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ingredients.map((ingredient) => (
              <button
                key={ingredient}
                type="button"
                onClick={() => handleRemove(ingredient)}
                className="group flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs uppercase tracking-wide text-slate-200 transition hover:border-red-400 hover:text-red-200"
              >
                {ingredient}
                <span className="text-slate-500 transition group-hover:text-red-300">×</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
