"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { foodGroups, foodPresets, type FoodPreset } from "@/data/food-presets";

type FoodPresetPickerProps = {
  onApply: (preset: FoodPreset) => void;
};

const categoryOptions = [{ id: "all", label: "All foods" }, ...foodGroups] as const;

export function FoodPresetPicker({ onApply }: FoodPresetPickerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categoryOptions)[number]["id"]>("ready");

  const filteredFoods = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return foodPresets.filter((preset) => {
      const matchesCategory = category === "all" || preset.group === category;
      const matchesQuery =
        !normalizedQuery ||
        [preset.name, preset.notes, preset.group].join(" ").toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <div className="rounded-2xl bg-white/[0.055] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="metric-label">Food shortcut</p>
          <p className="mt-1 text-xs font-semibold text-white/38">{filteredFoods.length} options</p>
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
          placeholder="Search Starbucks, fruit, protein..."
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-porcelain outline-none placeholder:text-white/28"
        />
      </label>

      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
        {filteredFoods.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => onApply(preset)}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-carbon/70 p-3 text-left transition hover:border-champagne/50"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-porcelain">{preset.name}</span>
              <span className="mt-1 block text-xs font-semibold capitalize text-white/35">{preset.group}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-sm font-bold text-champagne">{preset.calories}</span>
              <span className="text-xs font-semibold text-white/42">{preset.protein}g</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
