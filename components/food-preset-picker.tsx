"use client";

import { CheckCircle2, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { foodGroups, foodPresets, type FoodPreset } from "@/data/food-presets";

type FoodPresetPickerProps = {
  onChangeSelection: (presets: FoodPreset[]) => void;
  selectedNames?: string[];
};

const categoryOptions = [{ id: "all", label: "All foods" }, ...foodGroups] as const;

export function FoodPresetPicker({ onChangeSelection, selectedNames = [] }: FoodPresetPickerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categoryOptions)[number]["id"]>("all");
  const selectedSet = useMemo(() => new Set(selectedNames), [selectedNames]);
  const selectedPresets = useMemo(
    () => foodPresets.filter((preset) => selectedSet.has(preset.name)),
    [selectedSet],
  );
  const selectedCalories = selectedPresets.reduce((sum, preset) => sum + preset.calories, 0);
  const selectedProtein = selectedPresets.reduce((sum, preset) => sum + preset.protein, 0);

  const filteredFoods = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const isSearching = normalizedQuery.length > 0;

    return foodPresets.filter((preset) => {
      const matchesQuery =
        !normalizedQuery ||
        [preset.name, preset.notes, preset.group].join(" ").toLowerCase().includes(normalizedQuery);
      const matchesCategory = isSearching || category === "all" || preset.group === category;

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  function togglePreset(preset: FoodPreset) {
    const nextNames = selectedSet.has(preset.name)
      ? selectedNames.filter((name) => name !== preset.name)
      : [...selectedNames, preset.name];

    onChangeSelection(foodPresets.filter((food) => nextNames.includes(food.name)));
  }

  return (
    <div className="rounded-2xl bg-white/[0.055] p-3">
      {selectedPresets.length ? (
        <div className="mb-3 rounded-2xl border border-signal/35 bg-signal/10 p-3">
          <div className="mb-2 flex items-start justify-between gap-3">
            <span>
              <span className="block text-[0.62rem] font-black uppercase tracking-[0.22em] text-signal">
                Meal builder
              </span>
              <span className="mt-1 block text-sm font-bold text-porcelain">
                {selectedPresets.length} item{selectedPresets.length === 1 ? "" : "s"} selected
              </span>
              <span className="mt-1 block text-xs font-semibold text-white/48">
                {selectedCalories} cal - {selectedProtein}g protein
              </span>
            </span>
            <button
              type="button"
              onClick={() => onChangeSelection([])}
              className="grid size-9 shrink-0 place-items-center rounded-full bg-carbon/70 text-white/58"
              aria-label="Clear selected foods"
            >
              <X size={16} strokeWidth={2.2} aria-hidden />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedPresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => togglePreset(preset)}
                className="inline-flex min-h-8 max-w-full items-center gap-2 rounded-full bg-carbon/70 px-3 text-xs font-bold text-porcelain"
              >
                <span className="truncate">{preset.name}</span>
                <X size={13} strokeWidth={2.2} aria-hidden />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="metric-label">Food shortcuts</p>
          <p className="mt-1 text-xs font-semibold text-white/38">
            Tap multiple foods. Calories and protein below update automatically.
          </p>
        </div>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as (typeof categoryOptions)[number]["id"])}
          className="min-h-10 rounded-full border border-white/10 bg-carbon px-3 text-xs font-bold text-porcelain outline-none focus:border-champagne"
          aria-label="Food category"
        >
          {categoryOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex min-h-11 items-center gap-2 rounded-2xl border border-white/10 bg-carbon px-3 focus-within:border-champagne">
        <Search size={16} className="shrink-0 text-white/36" aria-hidden />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search all foods..."
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-porcelain outline-none placeholder:text-white/28"
        />
      </label>
      {query.trim() ? (
        <p className="mt-2 text-xs font-semibold text-white/38">
          Searching the full food library, across every category · {filteredFoods.length} result{filteredFoods.length === 1 ? "" : "s"}.
        </p>
      ) : null}

      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
        {filteredFoods.map((preset) => {
          const isSelected = selectedSet.has(preset.name);

          return (
            <button
              key={preset.name}
              type="button"
              aria-pressed={isSelected}
              onClick={() => togglePreset(preset)}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.99] ${
                isSelected
                  ? "border-signal/45 bg-signal/10 shadow-[0_0_24px_rgba(242,238,231,0.08)]"
                  : "border-white/10 bg-carbon/70 hover:border-champagne/50"
              }`}
            >
              <span className="min-w-0">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="block truncate text-sm font-semibold text-porcelain">{preset.name}</span>
                  {isSelected ? <CheckCircle2 size={15} className="shrink-0 text-signal" aria-hidden /> : null}
                </span>
                <span className="mt-1 block text-xs font-semibold capitalize text-white/35">{preset.group}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-sm font-bold text-champagne">{preset.calories}</span>
                <span className="text-xs font-semibold text-white/42">{preset.protein}g</span>
              </span>
            </button>
          );
        })}
        {filteredFoods.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-carbon/70 p-4 text-sm font-semibold text-white/45">
            No matching foods. Try another search or category.
          </div>
        ) : null}
      </div>
    </div>
  );
}
