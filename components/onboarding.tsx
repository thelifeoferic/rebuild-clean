"use client";

import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { OnboardingProfile } from "@/types/rebuild";

const goals = [
  "Lose weight",
  "Build strength",
  "Quit smoking",
  "Stop spiraling",
  "Improve cardio",
  "Eat better",
  "Sleep better",
  "Rebuild discipline",
];

const equipment = [
  "Bike",
  "StairMaster",
  "Jacob's Ladder",
  "Treadmill",
  "Row machine",
  "Elliptical",
  "Kettlebells",
  "Dumbbells",
  "Barbell",
  "Weight bench",
  "Cable machine",
  "Smith machine",
  "Pull-up bar",
  "Resistance bands",
  "Jump rope",
  "Medicine ball",
  "Bodyweight",
  "Farmer carry space",
];

const behaviorFocus = ["Smoking", "Anger", "Stress", "Boredom", "Stress eating", "Avoidance", "Late-night scrolling"];

export function Onboarding({
  onComplete,
}: {
  onComplete: (profile: OnboardingProfile) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["Lose weight", "Rebuild discipline"]);
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [why, setWhy] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(["Bike", "Kettlebells", "Dumbbells", "Weight bench"]);
  const [selectedFocus, setSelectedFocus] = useState<string[]>(["Smoking", "Avoidance"]);
  const [pressurePlan, setPressurePlan] = useState("Train first. Decide later.");

  function toggle(value: string, values: string[], update: (next: string[]) => void) {
    update(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  function numberOrUndefined(value: string) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }

  return (
    <section className="px-4 pb-4 pt-5">
      <div className="relative mb-5 min-h-[25rem] overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-panel">
        <Image
          src="/rebuild-conditioning.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 448px"
          className="object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.25),rgba(0,0,0,0.45)_35%,rgba(0,0,0,0.94))]" />
        <div className="relative flex min-h-[25rem] flex-col justify-end p-5">
          <div className="mb-5 w-52 overflow-hidden rounded-2xl border border-white/10 bg-black/75 backdrop-blur">
            <Image
              src="/rebuild-logo.png"
              alt="REBUILD. Better every day."
              width={1774}
              height={887}
              priority
              className="aspect-[2.4/1] w-full object-cover object-center"
            />
          </div>
          <p className="metric-label text-white/62">Welcome to REBUILD</p>
          <h1 className="mt-2 text-4xl font-semibold leading-none text-porcelain">Build the next version on purpose.</h1>
          <p className="mt-3 text-sm leading-5 text-white/62">
            Set your baseline, choose the tools you actually have access to, and define the behavior loops you are replacing.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="panel p-4">
          <p className="metric-label mb-3">Your baseline</p>
          <div className="space-y-3">
            <Field label="First name" value={firstName} onChange={setFirstName} placeholder="Eric" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Current weight" value={currentWeight} onChange={setCurrentWeight} placeholder="227" inputMode="decimal" suffix="lb" />
              <Field label="Target weight" value={targetWeight} onChange={setTargetWeight} placeholder="210" inputMode="decimal" suffix="lb" />
            </div>
            <TextArea
              label="Why this matters"
              value={why}
              onChange={setWhy}
              placeholder="A short sentence you want REBUILD to keep in view."
            />
          </div>
        </div>

        <ChoiceGroup
          title="Primary goals"
          helper="Pick the lanes REBUILD should optimize around."
          options={goals}
          selected={selectedGoals}
          onSelect={(value) => toggle(value, selectedGoals, setSelectedGoals)}
        />
        <ChoiceGroup
          title="Available equipment"
          helper="Choose what you can realistically use at home or at the gym."
          options={equipment}
          selected={selectedEquipment}
          onSelect={(value) => toggle(value, selectedEquipment, setSelectedEquipment)}
        />
        <ChoiceGroup
          title="Behavior loops to replace"
          helper="These become reset moments, not identity labels."
          options={behaviorFocus}
          selected={selectedFocus}
          onSelect={(value) => toggle(value, selectedFocus, setSelectedFocus)}
        />

        <div className="panel p-4">
          <p className="metric-label mb-2">Pressure protocol</p>
          <p className="mb-3 text-sm leading-5 text-white/50">
            One line for the moment when stress, boredom, anger, or craving tries to make the decision.
          </p>
          <TextArea label="When pressure hits" value={pressurePlan} onChange={setPressurePlan} />
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          onComplete({
            behaviorFocus: selectedFocus,
            completed: true,
            currentWeight: numberOrUndefined(currentWeight),
            equipment: selectedEquipment,
            firstName: firstName.trim(),
            goal: selectedGoals[0] ?? "Rebuild discipline",
            goals: selectedGoals,
            pressurePlan: pressurePlan.trim(),
            targetWeight: numberOrUndefined(targetWeight),
            why: why.trim(),
          })
        }
        className="mt-5 min-h-12 w-full rounded-2xl bg-champagne px-4 text-base font-bold text-carbon shadow-glow"
      >
        Enter REBUILD
      </button>
    </section>
  );
}

function ChoiceGroup({
  helper,
  onSelect,
  options,
  selected,
  title,
}: {
  helper?: string;
  onSelect: (value: string) => void;
  options: string[];
  selected: string[];
  title: string;
}) {
  return (
    <div className="panel p-4">
      <p className="metric-label mb-2">{title}</p>
      {helper ? <p className="mb-3 text-sm leading-5 text-white/45">{helper}</p> : null}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm font-semibold transition ${
                isSelected ? "border-champagne bg-champagne text-carbon" : "border-white/10 bg-white/[0.055] text-white/62"
              }`}
            >
              {isSelected ? <CheckCircle2 size={15} strokeWidth={2.2} aria-hidden /> : null}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  inputMode,
  label,
  onChange,
  placeholder,
  suffix,
  value,
}: {
  inputMode?: "decimal" | "numeric" | "text";
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="metric-label mb-2 block">{label}</span>
      <div className="flex min-h-12 items-center rounded-2xl border border-white/10 bg-carbon px-4 focus-within:border-champagne">
        <input
          value={value}
          inputMode={inputMode}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-base text-porcelain outline-none placeholder:text-white/25"
        />
        {suffix ? <span className="text-sm font-semibold text-white/40">{suffix}</span> : null}
      </div>
    </label>
  );
}

function TextArea({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="metric-label mb-2 block">{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-24 w-full rounded-2xl border border-white/10 bg-carbon px-4 py-3 text-base text-porcelain outline-none placeholder:text-white/25 focus:border-champagne"
      />
    </label>
  );
}
