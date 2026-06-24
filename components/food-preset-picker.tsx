"use client";

import { CheckCircle2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { foodGroups, foodPresets, type FoodPreset } from "@/data/food-presets";

type FoodPresetPickerProps = {
  onApply: (preset: FoodPreset) => void;
  selectedName?: string;
};

const categoryOptions = [{ id: "all", label: "All foods" }, ...foodGroups] as const;

export function FoodPresetPicker({ onApply, selectedName }: FoodPresetPickerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categoryOptions)[number]["id"]>("ready");
  const selectedPreset = foodPresets.find((preset) => preset.name === selectedName);

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
      {selectedPreset ? (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-signal/35 bg-signal/10 p-3">
          <span className="min-w-0">
            <span className="block text-[0.62rem] font-black uppercase tracking-[0.22em] text-signal">Applied</span>
            <span className="mt-1 block truncate text-sm font-bold text-porcelain">{selectedPreset.name}</span>
            <span className="mt-1 block text-xs font-semibold text-white/48">
              {selectedPreset.calories} cal - {selectedPreset.protein}g protein
            </span>
          </span>
          <CheckCircle2 size={22} className="shrink-0 text-signal" aria-hidden />
        </div>
      ) : null}

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
        {filteredFoods.map((preset) => {
          const isSelected = preset.name === selectedName;

          return (
            <button
              key={preset.name}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onApply(preset)}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.99] ${
                isSelected
                  ? "border-signal/45 bg-signal/10 shadow-[0_0_24px_rgba(47,226,168,0.08)]"
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
