"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, HTMLAttributes } from "react";
import { FoodPresetPicker } from "@/components/food-preset-picker";
import type { FoodPreset } from "@/data/food-presets";
import { getProfileMachineOptions, machineCategoryFor } from "@/data/gym-presets";
import { estimateBikeDistanceMiles } from "@/lib/bike-distance";
import { getTodayIso, normalizeLogDate } from "@/lib/rebuild-data";
import type { LogKind, MoodReason, OnboardingProfile } from "@/types/rebuild";

export type LogDraft = Record<string, string | boolean>;

const titles: Record<LogKind, string> = {
  weight: "Weigh-in",
  bike: "Bike Session",
  jacobsLadder: "Jacob's Ladder",
  pushUps: "Push-ups",
  dumbbellCurls: "Dumbbell Work",
  strength: "Strength Lift",
  machine: "Gym Machine",
  kettlebell: "Kettlebell Work",
  farmerCarries: "Farmer Carries",
  swim: "Swim Session",
  yoga: "Yoga Session",
  meal: "Meal",
  water: "Water",
  sleep: "Sleep",
  mood: "Pattern Interrupt",
};

const defaults: Record<LogKind, LogDraft> = {
  weight: { date: "", weight: "" },
  bike: { date: "", minutes: "", distanceMiles: "", resistance: "", calories: "", notes: "" },
  jacobsLadder: { date: "", duration: "", longestContinuous: "" },
  pushUps: { date: "", set1: "", set2: "", set3: "", set4: "", set5: "", set6: "", extraSets: "" },
  dumbbellCurls: { date: "", exercise: "Dumbbell curls", weight: "", repsEachArm: "" },
  strength: { date: "", exercise: "Bench press", weight: "", reps: "", notes: "" },
  machine: { date: "", gymName: "", machine: "Leg press", category: "Strength machine", weight: "", sets: "", reps: "", minutes: "", distanceMiles: "", calories: "", notes: "" },
  kettlebell: { date: "", exercise: "Pass-arounds", weight: "", reps: "" },
  farmerCarries: { date: "", weightEachHand: "", distanceFeet: "", rounds: "" },
  swim: { date: "", minutes: "", distance: "", stroke: "Freestyle", notes: "" },
  yoga: { date: "", minutes: "", focus: "Mobility", notes: "" },
  meal: { date: "", name: "", calories: "", protein: "", notes: "" },
  water: { date: "", ounces: "24" },
  sleep: { date: "", hours: "", quality: "good", notes: "" },
  mood: {
    date: "",
    reason: "stress",
    label: "Went to the gym",
    didntSmoke: true,
    didntSpiral: true,
  },
};

const moodReasons: MoodReason[] = ["stress", "anger", "boredom", "energy", "habit"];
const replacementActions = ["Went to the gym", "Meditation", "Read", "Journaled", "Walked", "Called a friend", "Early bedtime", "Healthy meal", "Stayed present"];
const sleepQualities = ["low", "okay", "good", "great"] as const;
const dumbbellExercises = [
  "Dumbbell curls",
  "Hammer curls",
  "Alternating curls",
  "Concentration curls",
  "Shoulder press",
  "Lateral raises",
  "Front raises",
  "Bent-over rows",
  "One-arm rows",
  "Chest press",
  "Floor press",
  "Goblet squat",
  "Romanian deadlift",
  "Triceps kickbacks",
  "Farmer carry",
] as const;
const strengthExercises = [
  "Bench press",
  "Chest press",
  "Shoulder press",
  "Leg press",
  "Hack squat",
  "Squat",
  "Deadlift",
  "Romanian deadlift",
  "Lat pulldown",
  "Seated row",
  "Cable row",
  "Cable fly",
  "Leg curl",
  "Leg extension",
  "Calf raise",
  "Triceps pressdown",
  "Biceps curls",
] as const;
const kettlebellExercises = [
  "Pass-arounds",
  "Around-the-worlds",
  "Swings",
  "Two-hand swings",
  "One-arm swings",
  "Alternating swings",
  "Goblet squats",
  "Front rack squats",
  "Lunges",
  "Reverse lunges",
  "Deadlifts",
  "Suitcase deadlifts",
  "Clean",
  "Clean and press",
  "Snatches",
  "High pulls",
  "Sumo deadlift high pulls",
  "Thrusters",
  "Turkish get-ups",
  "Windmills",
  "Halos",
  "Figure 8s",
  "Rows",
  "Single-arm rows",
  "Floor press",
  "Overhead press",
  "Russian twists",
  "Suitcase carries",
  "Rack carries",
  "Waiter carries",
] as const;

function defaultDraftFor(kind: LogKind): LogDraft {
  return { ...defaults[kind], date: getTodayIso() };
}

export function LogModal({
  initialDraft,
  kind,
  mode = "create",
  onClose,
  onSave,
  profile,
}: {
  initialDraft?: LogDraft | null;
  kind: LogKind | null;
  mode?: "create" | "edit";
  onClose: () => void;
  profile?: OnboardingProfile | null;
  onSave: (kind: LogKind, draft: LogDraft) => void;
}) {
  const machineOptions = useMemo(() => getProfileMachineOptions(profile ?? null), [profile]);
  const resolvedDraft = useMemo(
    () => {
      const base = defaultDraftFor(kind ?? "weight");
      const incoming = initialDraft
        ? {
            ...initialDraft,
            date: normalizeLogDate(String(initialDraft.date ?? base.date), getTodayIso()),
          }
        : {};

      return {
        ...base,
        ...incoming,
      };
    },
    [initialDraft, kind],
  );
  const [draft, setDraft] = useState<LogDraft>(resolvedDraft);

  useEffect(() => {
    setDraft(resolvedDraft);
  }, [resolvedDraft]);

  if (!kind) return null;
  const activeKind = kind;
  const estimatedBikeDistance = activeKind === "bike" && number(draft.minutes) > 0 && number(draft.distanceMiles) <= 0
    ? estimateBikeDistanceMiles({
        calories: number(draft.calories),
        minutes: number(draft.minutes),
        resistance: number(draft.resistance),
        weightLb: profile?.currentWeight,
      })
    : 0;
  const selectedMachineName = activeKind === "machine" ? String(draft.machine || machineOptions[0]?.name || "Leg press") : "";
  const inferredMachineCategory = selectedMachineName ? machineCategoryFor(selectedMachineName) : "";
  const selectedMachineCategory = activeKind === "machine"
    ? inferredMachineCategory !== "Strength machine" || !draft.category
      ? inferredMachineCategory
      : String(draft.category)
    : "";

  function update(name: string, value: string | boolean) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  function chooseMachine(value: string) {
    const match = machineOptions.find((machine) => machine.name === value);
    const category = match?.category ?? machineCategoryFor(value);

    setDraft((current) => {
      const next = {
        ...current,
        category,
        machine: value,
      };

      if (category === "Cardio") {
        return { ...next, reps: "", sets: "", weight: "" };
      }

      if (category === "Functional") {
        return { ...next, distanceMiles: "", weight: "" };
      }

      return { ...next, distanceMiles: "" };
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(
      activeKind,
      activeKind === "machine"
        ? {
            ...draft,
            category: selectedMachineCategory,
            machine: selectedMachineName,
          }
        : draft,
    );
  }

  function applyFoodPresets(presets: FoodPreset[]) {
    const calories = presets.reduce((sum, preset) => sum + preset.calories, 0);
    const protein = presets.reduce((sum, preset) => sum + preset.protein, 0);
    const names = presets.map((preset) => preset.name);

    setDraft((current) => ({
      ...current,
      selectedFoods: names.join("||"),
      name: names.join(" + "),
      calories: presets.length ? String(calories) : "",
      protein: presets.length ? String(protein) : "",
      notes: presets.map((preset) => `${preset.name}: ${preset.notes}`).join("\n"),
    }));
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-black/70 p-3 backdrop-blur-sm">
      <form onSubmit={submit} className="panel max-h-[88vh] w-full overflow-y-auto p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="metric-label">{mode === "edit" ? "Edit log" : "Save log"}</p>
            <h2 className="mt-1 text-2xl font-semibold text-porcelain">{titles[activeKind]}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-full bg-white/10 text-white/70"
            aria-label="Close"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="space-y-3">
          {activeKind === "weight" ? (
            <>
              <DateField value={String(draft.date)} onChange={update} />
              <Field label="Weight" name="weight" value={String(draft.weight)} onChange={update} inputMode="decimal" suffix="lb" />
            </>
          ) : null}

          {activeKind === "bike" ? (
            <>
              <DateField value={String(draft.date)} onChange={update} />
              <Field label="Minutes" name="minutes" value={String(draft.minutes)} onChange={update} inputMode="numeric" />
              <Field label="Distance" name="distanceMiles" value={String(draft.distanceMiles)} onChange={update} inputMode="decimal" suffix="mi" />
              {estimatedBikeDistance ? (
                <p className="rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-2 text-sm font-semibold leading-5 text-white/50">
                  Leave distance blank to use an estimated {formatBikeDistance(estimatedBikeDistance)} based on time, resistance, calories, and weight.
                </p>
              ) : null}
              <Field label="Resistance" name="resistance" value={String(draft.resistance)} onChange={update} inputMode="numeric" />
              <Field label="Calories" name="calories" value={String(draft.calories)} onChange={update} inputMode="numeric" />
              <TextArea label="Notes" name="notes" value={String(draft.notes)} onChange={update} />
            </>
          ) : null}

          {activeKind === "jacobsLadder" ? (
            <>
              <DateField value={String(draft.date)} onChange={update} />
              <Field label="Duration" name="duration" value={String(draft.duration)} onChange={update} />
              <Field label="Longest continuous" name="longestContinuous" value={String(draft.longestContinuous)} onChange={update} />
            </>
          ) : null}

          {activeKind === "pushUps" ? (
            <>
              <DateField value={String(draft.date)} onChange={update} />
              <PushUpSetFields draft={draft} onChange={update} />
            </>
          ) : null}

          {activeKind === "dumbbellCurls" ? (
            <>
              <DateField value={String(draft.date)} onChange={update} />
              <SelectField label="Exercise" name="exercise" value={String(draft.exercise || "Dumbbell curls")} options={dumbbellExercises} onChange={update} />
              <Field label="Weight each dumbbell" name="weight" value={String(draft.weight)} onChange={update} inputMode="numeric" suffix="lb" />
              <Field label="Reps per arm / side" name="repsEachArm" value={String(draft.repsEachArm)} onChange={update} inputMode="numeric" />
            </>
          ) : null}

          {activeKind === "strength" ? (
            <>
              <DateField value={String(draft.date)} onChange={update} />
              <SelectField label="Exercise" name="exercise" value={String(draft.exercise || "Bench press")} options={strengthExercises} onChange={update} />
              <Field label="Weight" name="weight" value={String(draft.weight)} onChange={update} inputMode="numeric" suffix="lb" />
              <Field label="Reps" name="reps" value={String(draft.reps)} onChange={update} inputMode="numeric" />
              <TextArea label="Notes" name="notes" value={String(draft.notes)} onChange={update} />
            </>
          ) : null}

          {activeKind === "machine" ? (
            <>
              <DateField value={String(draft.date)} onChange={update} />
              <Field label="Home gym" name="gymName" value={String(draft.gymName || profile?.homeGymName || "Gym")} onChange={update} />
              <SelectField
                label="Machine"
                name="machine"
                value={selectedMachineName}
                options={machineOptions.map((machine) => machine.name)}
                onChange={(_, value) => chooseMachine(value)}
              />
              <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3">
                <p className="metric-label">Logging profile</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-champagne px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-carbon">
                    {selectedMachineCategory || "Equipment"}
                  </span>
                  <span className="text-sm font-semibold text-white/56">{machineFormHelp(selectedMachineCategory, selectedMachineName)}</span>
                </div>
              </div>

              {selectedMachineCategory === "Cardio" ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Minutes" name="minutes" value={String(draft.minutes)} onChange={update} inputMode="numeric" />
                    <Field label={cardioDistanceLabel(selectedMachineName)} name="distanceMiles" value={String(draft.distanceMiles)} onChange={update} inputMode="decimal" suffix={cardioDistanceSuffix(selectedMachineName)} />
                  </div>
                  <Field label="Calories" name="calories" value={String(draft.calories)} onChange={update} inputMode="numeric" />
                </>
              ) : selectedMachineCategory === "Functional" ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Minutes" name="minutes" value={String(draft.minutes)} onChange={update} inputMode="numeric" />
                    <Field label="Rounds / sets" name="sets" value={String(draft.sets)} onChange={update} inputMode="numeric" />
                    <Field label="Reps / intervals" name="reps" value={String(draft.reps)} onChange={update} inputMode="numeric" />
                    <Field label="Calories" name="calories" value={String(draft.calories)} onChange={update} inputMode="numeric" />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Weight / setting" name="weight" value={String(draft.weight)} onChange={update} inputMode="decimal" suffix="lb" />
                    <Field label="Sets" name="sets" value={String(draft.sets)} onChange={update} inputMode="numeric" />
                    <Field label="Reps" name="reps" value={String(draft.reps)} onChange={update} inputMode="numeric" />
                    <Field label="Minutes" name="minutes" value={String(draft.minutes)} onChange={update} inputMode="numeric" />
                  </div>
                  <Field label="Calories" name="calories" value={String(draft.calories)} onChange={update} inputMode="numeric" />
                </>
              )}
              <TextArea label="Notes" name="notes" value={String(draft.notes)} onChange={update} />
            </>
          ) : null}

          {activeKind === "kettlebell" ? (
            <>
              <DateField value={String(draft.date)} onChange={update} />
              <SelectField label="Exercise" name="exercise" value={String(draft.exercise || "Pass-arounds")} options={kettlebellExercises} onChange={update} />
              <Field label="Weight" name="weight" value={String(draft.weight)} onChange={update} inputMode="numeric" suffix="lb" />
              <Field label="Reps" name="reps" value={String(draft.reps)} onChange={update} inputMode="numeric" />
            </>
          ) : null}

          {activeKind === "farmerCarries" ? (
            <>
              <DateField value={String(draft.date)} onChange={update} />
              <Field label="Weight each hand" name="weightEachHand" value={String(draft.weightEachHand)} onChange={update} inputMode="numeric" suffix="lb" />
              <Field label="Distance" name="distanceFeet" value={String(draft.distanceFeet)} onChange={update} inputMode="numeric" suffix="ft" />
              <Field label="Rounds" name="rounds" value={String(draft.rounds)} onChange={update} inputMode="numeric" />
            </>
          ) : null}

          {activeKind === "swim" ? (
            <>
              <DateField value={String(draft.date)} onChange={update} />
              <Field label="Minutes" name="minutes" value={String(draft.minutes)} onChange={update} inputMode="numeric" />
              <Field label="Distance" name="distance" value={String(draft.distance)} onChange={update} inputMode="numeric" suffix="yd" />
              <Field label="Stroke" name="stroke" value={String(draft.stroke)} onChange={update} />
              <TextArea label="Notes" name="notes" value={String(draft.notes)} onChange={update} />
            </>
          ) : null}

          {activeKind === "yoga" ? (
            <>
              <DateField value={String(draft.date)} onChange={update} />
              <Field label="Minutes" name="minutes" value={String(draft.minutes)} onChange={update} inputMode="numeric" />
              <Field label="Focus" name="focus" value={String(draft.focus)} onChange={update} />
              <TextArea label="Notes" name="notes" value={String(draft.notes)} onChange={update} />
            </>
          ) : null}

          {activeKind === "meal" ? (
            <>
              <FoodPresetPicker onChangeSelection={applyFoodPresets} selectedNames={selectedFoodNames(draft)} />
              <DateField value={String(draft.date)} onChange={update} />
              <Field label="Name" name="name" value={String(draft.name)} onChange={update} />
              <Field label="Calories" name="calories" value={String(draft.calories)} onChange={update} inputMode="numeric" />
              <Field label="Protein" name="protein" value={String(draft.protein)} onChange={update} inputMode="numeric" suffix="g" />
              <TextArea label="Notes" name="notes" value={String(draft.notes)} onChange={update} />
            </>
          ) : null}

          {activeKind === "water" ? (
            <>
              <DateField value={String(draft.date)} onChange={update} />
              <Field label="Water" name="ounces" value={String(draft.ounces)} onChange={update} inputMode="numeric" suffix="oz" />
            </>
          ) : null}

          {activeKind === "sleep" ? (
            <>
              <DateField value={String(draft.date)} onChange={update} />
              <Field label="Hours" name="hours" value={String(draft.hours)} onChange={update} inputMode="decimal" />
              <label className="block">
                <span className="metric-label mb-2 block">Quality</span>
                <select
                  value={String(draft.quality)}
                  onChange={(event) => update("quality", event.target.value)}
                  className="min-h-12 w-full rounded-2xl border border-white/10 bg-carbon px-4 text-base text-porcelain outline-none focus:border-champagne"
                >
                  {sleepQualities.map((quality) => (
                    <option key={quality} value={quality}>
                      {quality}
                    </option>
                  ))}
                </select>
              </label>
              <TextArea label="Notes" name="notes" value={String(draft.notes)} onChange={update} />
            </>
          ) : null}

          {activeKind === "mood" ? (
            <>
              <DateField value={String(draft.date)} onChange={update} />
              <label className="block">
                <span className="metric-label mb-2 block">Reason</span>
                <select
                  value={String(draft.reason)}
                  onChange={(event) => update("reason", event.target.value)}
                  className="min-h-12 w-full rounded-2xl border border-white/10 bg-carbon px-4 text-base text-porcelain outline-none focus:border-champagne"
                >
                  {moodReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <p className="metric-label mb-2">What did you do instead?</p>
                <div className="flex flex-wrap gap-2">
                  {replacementActions.map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => update("label", action)}
                      className={`min-h-10 rounded-full border px-3 text-sm font-semibold ${
                        draft.label === action ? "border-champagne bg-champagne text-carbon" : "border-white/10 bg-white/[0.055] text-white/62"
                      }`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
              <TextArea label="Custom replacement" name="label" value={String(draft.label)} onChange={update} />
            </>
          ) : null}
        </div>

        <button type="submit" className="mt-5 min-h-12 w-full rounded-2xl bg-champagne px-4 text-base font-bold text-carbon shadow-glow">
          {mode === "edit" ? "Save changes" : "Save to REBUILD"}
        </button>
      </form>
    </div>
  );
}

function selectedFoodNames(draft: LogDraft) {
  return String(draft.selectedFoods ?? "")
    .split("||")
    .map((name) => name.trim())
    .filter(Boolean);
}

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatBikeDistance(value: number) {
  return `${value.toFixed(value >= 10 ? 1 : 2)} mi`;
}

function machineFormHelp(category: string, machine: string) {
  const normalized = machine.toLowerCase();

  if (category === "Cardio") {
    if (normalized.includes("row")) return "Time, distance, and calories. No load fields.";
    if (normalized.includes("stair")) return "Time, distance, and calories. No sets or reps.";
    return "Time, distance, and calories. No weight-lifting fields.";
  }

  if (category === "Functional") return "Rounds, intervals, time, and optional calories.";
  if (category === "Free weights") return "Load, sets, reps, and optional time.";
  if (category === "Recovery") return "Time and notes.";
  return "Load or setting, sets, reps, and optional time.";
}

function cardioDistanceLabel(machine: string) {
  return machine.toLowerCase().includes("stair") ? "Distance / floors" : "Distance";
}

function cardioDistanceSuffix(machine: string) {
  return machine.toLowerCase().includes("stair") ? "" : "mi";
}

function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string, value: string) => void;
}) {
  return <Field label="Date" name="date" type="date" value={normalizeLogDate(value, getTodayIso())} onChange={onChange} />;
}

function SelectField({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: readonly string[];
  onChange: (name: string, value: string) => void;
}) {
  return (
    <label className="block">
      <span className="metric-label mb-2 block">{label}</span>
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        className="min-h-12 w-full rounded-2xl border border-white/10 bg-carbon px-4 text-base text-porcelain outline-none focus:border-champagne"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  inputMode,
  placeholder,
  suffix,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
  suffix?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="metric-label mb-2 block">{label}</span>
      <div className="flex min-h-12 items-center rounded-2xl border border-white/10 bg-carbon px-4 focus-within:border-champagne">
        <input
          name={name}
          type={type}
          value={value}
          inputMode={inputMode}
          placeholder={placeholder}
          onChange={(event) => onChange(name, event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-base text-porcelain outline-none placeholder:text-white/25"
        />
        {suffix ? <span className="text-sm font-semibold text-white/40">{suffix}</span> : null}
      </div>
    </label>
  );
}

function TextArea({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <label className="block">
      <span className="metric-label mb-2 block">{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        className="min-h-24 w-full rounded-2xl border border-white/10 bg-carbon px-4 py-3 text-base text-porcelain outline-none focus:border-champagne"
      />
    </label>
  );
}

function Check({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: (name: string, value: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 items-center justify-between rounded-2xl border border-white/10 bg-carbon px-4">
      <span className="font-semibold text-porcelain">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(name, event.target.checked)}
        className="size-5 accent-champagne"
      />
    </label>
  );
}

function PushUpSetFields({
  draft,
  onChange,
}: {
  draft: LogDraft;
  onChange: (name: string, value: string) => void;
}) {
  const setNames = ["set1", "set2", "set3", "set4", "set5", "set6"];
  const reps = [
    ...setNames.map((name) => Number(draft[name] || 0)),
    ...String(draft.extraSets ?? "")
      .split(",")
      .map((value) => Number(value.trim())),
  ].filter((value) => Number.isFinite(value) && value > 0);
  const total = reps.reduce((sum, value) => sum + value, 0);

  return (
    <div className="rounded-2xl bg-white/[0.055] p-3">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="metric-label">Reps by set</p>
          <p className="mt-1 text-xs leading-4 text-white/40">Enter the reps you actually completed in each set.</p>
        </div>
        <div className="rounded-2xl bg-carbon px-3 py-2 text-right">
          <p className="text-xl font-semibold text-porcelain">{total}</p>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white/35">total</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {setNames.map((name, index) => (
          <label key={name} className="block">
            <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white/35">Set {index + 1}</span>
            <input
              value={String(draft[name] ?? "")}
              inputMode="numeric"
              onChange={(event) => onChange(name, event.target.value)}
              className="min-h-12 w-full rounded-2xl border border-white/10 bg-carbon px-3 text-center text-lg font-semibold text-porcelain outline-none placeholder:text-white/25 focus:border-champagne"
            />
          </label>
        ))}
      </div>
      <label className="mt-3 block">
        <span className="metric-label mb-2 block">Extra sets</span>
        <input
          value={String(draft.extraSets ?? "")}
          placeholder="Example: 8, 7, 5"
          onChange={(event) => onChange("extraSets", event.target.value)}
          className="min-h-12 w-full rounded-2xl border border-white/10 bg-carbon px-4 text-base text-porcelain outline-none placeholder:text-white/25 focus:border-champagne"
        />
      </label>
    </div>
  );
}
