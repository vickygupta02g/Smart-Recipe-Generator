import type { ChangeEvent } from "react";
import { cn } from "../utils/cn";

export type FiltersState = {
  difficulty: "any" | "easy" | "medium" | "hard";
  maxCookingTime?: number;
  dietaryRestrictions?: string[];
};

interface FiltersPanelProps {
  filters: FiltersState;
  servings?: number;
  onFiltersChange: (filters: FiltersState) => void;
  onServingsChange: (servings?: number) => void;
}

const DIFFICULTY_OPTIONS: FiltersState["difficulty"][] = ["any", "easy", "medium", "hard"];
const DIETARY_OPTIONS = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "pescatarian",
  "keto",
  "halal",
  "kosher",
];

export function FiltersPanel({ filters, servings, onFiltersChange, onServingsChange }: FiltersPanelProps) {
  const handleDifficultyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, difficulty: event.target.value as FiltersState["difficulty"] });
  };

  const handleTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.valueAsNumber;
    if (Number.isNaN(value)) {
      onFiltersChange({ ...filters, maxCookingTime: undefined });
      return;
    }
    onFiltersChange({ ...filters, maxCookingTime: Math.max(5, value) });
  };

  const handleDietaryToggle = (tag: string) => {
    const current = new Set(filters.dietaryRestrictions ?? []);
    if (current.has(tag)) {
      current.delete(tag);
    } else {
      current.add(tag);
    }
    onFiltersChange({ ...filters, dietaryRestrictions: Array.from(current) });
  };

  const handleServingsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.valueAsNumber;
    if (Number.isNaN(value)) {
      onServingsChange(undefined);
      return;
    }
    onServingsChange(Math.max(1, Math.min(12, value)));
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-slate-400">Difficulty</span>
          <select
            value={filters.difficulty}
            onChange={handleDifficultyChange}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-primary-400 focus:outline-none"
          >
            {DIFFICULTY_OPTIONS.map((option) => (
              <option key={option} value={option} className="text-slate-900">
                {option === "any" ? "Any difficulty" : option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-slate-400">Max cook time (min)</span>
          <input
            type="number"
            min={5}
            step={5}
            value={filters.maxCookingTime ?? ""}
            onChange={handleTimeChange}
            placeholder="Optional"
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
          />
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-slate-400">Dietary filters</span>
          <button
            type="button"
            className="text-xs uppercase tracking-wide text-slate-400 hover:text-slate-200"
            onClick={() => onFiltersChange({ ...filters, dietaryRestrictions: [] })}
          >
            Clear
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleDietaryToggle(tag)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition",
                filters.dietaryRestrictions?.includes(tag)
                  ? "border-primary-400 bg-primary-500/20 text-primary-200"
                  : "border-slate-700 bg-slate-950 text-slate-300 hover:border-primary-500/60 hover:text-primary-200"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide text-slate-400">Servings</span>
        <input
          type="number"
          min={1}
          max={12}
          value={servings ?? ""}
          placeholder="Default"
          onChange={handleServingsChange}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
        />
      </label>
    </section>
  );
}
