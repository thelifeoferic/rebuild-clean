import { Bike, Brain, Dumbbell, Flame, Footprints, Home, Salad, Scale, Trophy, Waves, Zap } from "lucide-react";
import { Section } from "@/components/section";
import type { LogKind } from "@/types/rebuild";

const logTypes = [
  { kind: "weight", label: "Weigh-in", detail: "bodyweight and date", icon: Scale },
  { kind: "bike", label: "Bike session", detail: "minutes, distance, resistance, calories", icon: Bike },
  { kind: "jacobsLadder", label: "Jacob's Ladder", detail: "duration and longest attempt", icon: Flame },
  { kind: "pushUps", label: "Push-ups", detail: "reps by set, total counted", icon: Trophy },
  { kind: "dumbbellCurls", label: "Dumbbell curls", detail: "weight and each arm", icon: Dumbbell },
  { kind: "strength", label: "Strength lift", detail: "exercise, load, reps", icon: Dumbbell },
  { kind: "kettlebell", label: "Kettlebell", detail: "exercise, weight, reps", icon: Dumbbell },
  { kind: "farmerCarries", label: "Farmer carries", detail: "load, distance, rounds", icon: Footprints },
  { kind: "swim", label: "Swim", detail: "minutes, distance, stroke", icon: Waves },
  { kind: "yoga", label: "Yoga", detail: "minutes, focus, notes", icon: Flame },
  { kind: "meal", label: "Meal", detail: "calories, protein, notes", icon: Salad },
  { kind: "mood", label: "Mood reset", detail: "stress, anger, boredom", icon: Brain },
];

const moods = ["stress", "anger", "boredom", "energy", "habit"];

const routineShortcuts = [
  {
    title: "Reset 20",
    detail: "Home circuit: push-ups, squats, carries",
    kind: "pushUps",
    icon: Home,
  },
  {
    title: "Bike + Bells",
    detail: "Bike minutes plus kettlebell finisher",
    kind: "bike",
    icon: Bike,
  },
  {
    title: "Strength A",
    detail: "Full-body gym lift, then log load",
    kind: "strength",
    icon: Dumbbell,
  },
  {
    title: "Low-energy win",
    detail: "Protect the day with one reset log",
    kind: "mood",
    icon: Zap,
  },
] as const;

export function QuickAdd({ onSelect }: { onSelect: (kind: LogKind) => void }) {
  return (
    <Section id="quick-add" eyebrow="Capture fast" title="Quick Add">
      <div className="panel p-4">
        <div className="mb-4">
          <p className="metric-label mb-3">Saved routines</p>
          <div className="grid gap-2">
            {routineShortcuts.map((routine) => {
              const Icon = routine.icon;
              return (
                <button
                  key={routine.title}
                  type="button"
                  onClick={() => onSelect(routine.kind)}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-3 text-left transition hover:border-champagne/50"
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne">
                    <Icon size={18} strokeWidth={2.2} aria-hidden />
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-porcelain">{routine.title}</span>
                    <span className="mt-1 block text-sm leading-5 text-white/45">{routine.detail}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {logTypes.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onSelect(item.kind as LogKind)}
                className="min-h-28 rounded-2xl border border-white/10 bg-carbon/70 p-3 text-left transition hover:border-champagne/50 hover:bg-white/10"
              >
                <Icon className="mb-3 text-champagne" size={20} strokeWidth={2.1} aria-hidden />
                <span className="block text-sm font-semibold text-porcelain">{item.label}</span>
                <span className="mt-1 block text-xs leading-4 text-white/45">{item.detail}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl bg-white/[0.055] p-3">
          <p className="metric-label mb-3">Reset reason</p>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                type="button"
                onClick={() => onSelect("mood")}
                className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold capitalize text-white/68 transition hover:border-ember/60 hover:text-porcelain"
              >
                {mood}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => onSelect("mood")} className="rounded-2xl bg-signal px-3 py-3 text-sm font-bold text-carbon">
              Did not smoke
            </button>
            <button type="button" onClick={() => onSelect("mood")} className="rounded-2xl bg-champagne px-3 py-3 text-sm font-bold text-carbon">
              Did not spiral
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}
