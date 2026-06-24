"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, HTMLAttributes } from "react";
import { foodGroups, foodPresets } from "@/data/food-presets";
import type { LogKind, MoodReason } from "@/types/rebuild";

type Draft = Record<string, string | boolean>;

const titles: Record<LogKind, string> = {
  weight: "Weigh-in",
  bike: "Bike Session",
  jacobsLadder: "Jacob's Ladder",
  pushUps: "Push-ups",
  dumbbellCurls: "Dumbbell Curls",
  kettlebell: "Kettlebell Work",
  farmerCarries: "Farmer Carries",
  meal: "Meal",
  mood: "Mood Reset",
};

const defaults: Record<LogKind, Draft> = {
  weight: { date: "Today", weight: "227.0" },
  bike: { date: "Today", minutes: "30", resistance: "8", calories: "300", notes: "" },
  jacobsLadder: { date: "Today", duration: "8:00", longestContinuous: "3:30" },
  pushUps: { date: "Today", sets: "14, 12, 10" },
  dumbbellCurls: { date: "Today", weight: "35", repsEachArm: "20" },
  kettlebell: { date: "Today", exercise: "Pass-arounds", weight: "25", reps: "60" },
  farmerCarries: { date: "Today", weightEachHand: "20", distanceFeet: "60", rounds: "4" },
  meal: { name: "", calories: "500", protein: "35", notes: "" },
  mood: {
    date: "Today",
    reason: "stress",
    label: "Chose the reset instead of the old loop",
    didntSmoke: true,
    didntSpiral: true,
  },
};

const moodReasons: MoodReason[] = ["stress", "anger", "boredom", "energy", "habit"];

export function LogModal({
  kind,
  onClose,
  onSave,
}: {
  kind: LogKind | null;
  onClose: () => void;
  onSave: (kind: LogKind, draft: Draft) => void;
}) {
  const initialDraft = useMemo(() => (kind ? defaults[kind] : defaults.weight), [kind]);
  const [draft, setDraft] = useState<Draft>(initialDraft);

  useEffect(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  if (!kind) return null;
  const activeKind = kind;

  function update(name: string, value: string | boolean) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(activeKind, draft);
  }

  function applyFoodPreset(name: string, calories: number, protein: number, notes: string) {
    setDraft((current) => ({
      ...current,
      name,
      calories: String(calories),
      protein: String(protein),
      notes,
    }));
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-black/70 p-3 backdrop-blur-sm">
      <form onSubmit={submit} className="panel max-h-[88vh] w-full overflow-y-auto p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="metric-label">Save log</p>
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
              <Field label="Date" name="date" value={String(draft.date)} onChange={update} />
              <Field label="Weight" name="weight" value={String(draft.weight)} onChange={update} inputMode="decimal" suffix="lb" />
            </>
          ) : null}

          {activeKind === "bike" ? (
            <>
              <Field label="Date" name="date" value={String(draft.date)} onChange={update} />
              <Field label="Minutes" name="minutes" value={String(draft.minutes)} onChange={update} inputMode="numeric" />
              <Field label="Resistance" name="resistance" value={String(draft.resistance)} onChange={update} inputMode="numeric" />
              <Field label="Calories" name="calories" value={String(draft.calories)} onChange={update} inputMode="numeric" />
              <TextArea label="Notes" name="notes" value={String(draft.notes)} onChange={update} />
            </>
          ) : null}

          {activeKind === "jacobsLadder" ? (
            <>
              <Field label="Date" name="date" value={String(draft.date)} onChange={update} />
              <Field label="Duration" name="duration" value={String(draft.duration)} onChange={update} />
              <Field label="Longest continuous" name="longestContinuous" value={String(draft.longestContinuous)} onChange={update} />
            </>
          ) : null}

          {activeKind === "pushUps" ? (
            <>
              <Field label="Date" name="date" value={String(draft.date)} onChange={update} />
              <Field label="Sets" name="sets" value={String(draft.sets)} onChange={update} />
            </>
          ) : null}

          {activeKind === "dumbbellCurls" ? (
            <>
              <Field label="Date" name="date" value={String(draft.date)} onChange={update} />
              <Field label="Weight" name="weight" value={String(draft.weight)} onChange={update} inputMode="numeric" suffix="lb" />
              <Field label="Reps each arm" name="repsEachArm" value={String(draft.repsEachArm)} onChange={update} inputMode="numeric" />
            </>
          ) : null}

          {activeKind === "kettlebell" ? (
            <>
              <Field label="Date" name="date" value={String(draft.date)} onChange={update} />
              <Field label="Exercise" name="exercise" value={String(draft.exercise)} onChange={update} />
              <Field label="Weight" name="weight" value={String(draft.weight)} onChange={update} inputMode="numeric" suffix="lb" />
              <Field label="Reps" name="reps" value={String(draft.reps)} onChange={update} inputMode="numeric" />
            </>
          ) : null}

          {activeKind === "farmerCarries" ? (
            <>
              <Field label="Date" name="date" value={String(draft.date)} onChange={update} />
              <Field label="Weight each hand" name="weightEachHand" value={String(draft.weightEachHand)} onChange={update} inputMode="numeric" suffix="lb" />
              <Field label="Distance" name="distanceFeet" value={String(draft.distanceFeet)} onChange={update} inputMode="numeric" suffix="ft" />
              <Field label="Rounds" name="rounds" value={String(draft.rounds)} onChange={update} inputMode="numeric" />
            </>
          ) : null}

          {activeKind === "meal" ? (
            <>
              <div className="rounded-2xl bg-white/[0.055] p-3">
                <p className="metric-label mb-3">Tap a common option</p>
                <div className="space-y-3">
                  {foodGroups.map((group) => (
                    <div key={group.id}>
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-white/35">{group.label}</p>
                      <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-1">
                        {foodPresets
                          .filter((preset) => preset.group === group.id)
                          .map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => applyFoodPreset(preset.name, preset.calories, preset.protein, preset.notes)}
                              className="rounded-full border border-white/10 px-3 py-2 text-left text-xs font-semibold text-white/65"
                            >
                              {preset.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Field label="Name" name="name" value={String(draft.name)} onChange={update} />
              <Field label="Calories" name="calories" value={String(draft.calories)} onChange={update} inputMode="numeric" />
              <Field label="Protein" name="protein" value={String(draft.protein)} onChange={update} inputMode="numeric" suffix="g" />
              <TextArea label="Notes" name="notes" value={String(draft.notes)} onChange={update} />
            </>
          ) : null}

          {activeKind === "mood" ? (
            <>
              <Field label="Date" name="date" value={String(draft.date)} onChange={update} />
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
              <TextArea label="Reset note" name="label" value={String(draft.label)} onChange={update} />
              <Check label="Did not smoke" name="didntSmoke" checked={Boolean(draft.didntSmoke)} onChange={update} />
              <Check label="Did not spiral" name="didntSpiral" checked={Boolean(draft.didntSpiral)} onChange={update} />
            </>
          ) : null}
        </div>

        <button type="submit" className="mt-5 min-h-12 w-full rounded-2xl bg-champagne px-4 text-base font-bold text-carbon shadow-glow">
          Save to REBUILD
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  inputMode,
  suffix,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="metric-label mb-2 block">{label}</span>
      <div className="flex min-h-12 items-center rounded-2xl border border-white/10 bg-carbon px-4 focus-within:border-champagne">
        <input
          name={name}
          value={value}
          inputMode={inputMode}
          onChange={(event) => onChange(name, event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-base text-porcelain outline-none"
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
