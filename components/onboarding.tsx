"use client";

import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { OnboardingProfile } from "@/types/rebuild";

const goals = ["Lose weight", "Build strength", "Quit smoking", "Stop spiraling", "Rebuild discipline"];
const equipment = [
  "Bike",
  "Kettlebells",
  "Dumbbells",
  "Jacob's Ladder",
  "Bodyweight",
  "Treadmill",
  "Row machine",
  "Cable machine",
  "Pull-up bar",
  "Resistance bands",
  "Jump rope",
  "Medicine ball",
  "Bench",
  "Barbell",
];
const behaviorFocus = ["Smoking", "Anger", "Heartbreak", "Boredom", "Stress eating", "Avoidance"];
const resetPlans = ["Gym", "Walk", "Playlist", "Call someone", "Journal", "Cold shower"];

export function Onboarding({
  onComplete,
}: {
  onComplete: (profile: OnboardingProfile) => void;
}) {
  const [goal, setGoal] = useState(goals[0]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(["Bike", "Kettlebells", "Dumbbells"]);
  const [selectedFocus, setSelectedFocus] = useState<string[]>(["Smoking", "Avoidance"]);
  const [resetPlan, setResetPlan] = useState("Gym");

  function toggle(value: string, values: string[], update: (next: string[]) => void) {
    update(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  return (
    <section className="px-4 pb-4 pt-5">
      <div className="mb-5">
        <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
          <Image
            src="/rebuild-logo.png"
            alt="REBUILD. Better every day."
            width={1774}
            height={887}
            priority
            className="aspect-[2.4/1] w-full object-cover object-center"
          />
        </div>
        <p className="metric-label mb-2">Set the operating mode</p>
        <p className="mt-3 text-sm leading-5 text-white/55">
          Choose the few inputs that shape the dashboard. You can start logging immediately after this.
        </p>
      </div>

      <div className="space-y-4">
        <ChoiceGroup title="Primary goal" options={goals} selected={[goal]} onSelect={(value) => setGoal(value)} single />
        <ChoiceGroup
          title="Available equipment"
          options={equipment}
          selected={selectedEquipment}
          onSelect={(value) => toggle(value, selectedEquipment, setSelectedEquipment)}
        />
        <ChoiceGroup
          title="Behavior focus"
          options={behaviorFocus}
          selected={selectedFocus}
          onSelect={(value) => toggle(value, selectedFocus, setSelectedFocus)}
        />
        <div>
          <ChoiceGroup title="Go-to reset action" options={resetPlans} selected={[resetPlan]} onSelect={(value) => setResetPlan(value)} single />
          <p className="mt-2 px-1 text-xs leading-5 text-white/45">
            This is the first healthy move REBUILD suggests when stress, boredom, anger, or cravings hit.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          onComplete({
            behaviorFocus: selectedFocus,
            completed: true,
            equipment: selectedEquipment,
            goal,
            resetPlan,
          })
        }
        className="mt-5 min-h-12 w-full rounded-2xl bg-champagne px-4 text-base font-bold text-carbon shadow-glow"
      >
        Rebuild
      </button>
    </section>
  );
}

function ChoiceGroup({
  onSelect,
  options,
  selected,
  single,
  title,
}: {
  onSelect: (value: string) => void;
  options: string[];
  selected: string[];
  single?: boolean;
  title: string;
}) {
  return (
    <div className="panel p-4">
      <p className="metric-label mb-3">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm font-semibold transition ${
                isSelected
                  ? "border-champagne bg-champagne text-carbon"
                  : "border-white/10 bg-white/[0.055] text-white/62"
              }`}
            >
              {isSelected ? <CheckCircle2 size={15} strokeWidth={2.2} aria-hidden /> : null}
              {option}
              {single && isSelected ? "" : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
