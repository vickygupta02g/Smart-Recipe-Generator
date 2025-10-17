import type { DietaryTag } from "../types/api";

interface DietaryPreferencesProps {
  preferences: string[];
  onChange: (values: DietaryTag[]) => void;
}

const OPTIONS: DietaryTag[] = [
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

export function DietaryPreferences({ preferences, onChange }: DietaryPreferencesProps) {
  const handleToggle = (value: DietaryTag) => {
    const set = new Set(preferences.map((item) => item.toLowerCase()));
    if (set.has(value)) {
      set.delete(value);
    } else {
      set.add(value);
    }
    onChange(Array.from(set) as DietaryTag[]);
  };

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Dietary preferences</h3>
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-xs uppercase tracking-wide text-slate-400 hover:text-slate-200"
        >
          Reset
        </button>
      </header>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((option) => {
          const active = preferences.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleToggle(option)}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition ${
                active
                  ? "border-primary-400 bg-primary-500/20 text-primary-200"
                  : "border-slate-700 bg-slate-950 text-slate-300 hover:border-primary-500/60 hover:text-primary-200"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}
