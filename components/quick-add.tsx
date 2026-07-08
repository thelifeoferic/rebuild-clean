import { Bike, Brain, ChevronRight, Droplets, Dumbbell, Flame, Footprints, Home, Moon, Salad, Scale, Trophy, Waves, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section } from "@/components/section";
import { VoiceWorkoutLog, type VoiceLogItem } from "@/components/voice-workout-log";
import { WorkoutStopwatch } from "@/components/workout-stopwatch";
import type { LogKind, OnboardingProfile } from "@/types/rebuild";

const logTypes: Array<{ detail: string; draft?: Record<string, string>; icon: LucideIcon; kind: LogKind; label: string }> = [
  { kind: "weight", label: "Weigh-in", detail: "bodyweight and date", icon: Scale },
  { kind: "bike", label: "Bike session", detail: "minutes, distance, resistance, calories", icon: Bike },
  { kind: "jacobsLadder", label: "Jacob's Ladder", detail: "duration and longest attempt", icon: Flame },
  { kind: "pushUps", label: "Push-ups", detail: "reps by set, total counted", icon: Trophy },
  { kind: "dumbbellCurls", label: "Dumbbell work", detail: "exercise, weight, each arm", icon: Dumbbell },
  { kind: "strength", label: "Strength lift", detail: "exercise, load, reps", icon: Dumbbell },
  { kind: "machine", label: "Gym equipment", detail: "fields match the machine", icon: Dumbbell },
  { kind: "kettlebell", label: "Kettlebell", detail: "exercise, weight, reps", icon: Dumbbell },
  { kind: "farmerCarries", label: "Farmer carries", detail: "load, distance, rounds", icon: Footprints },
  { kind: "machine", label: "Walk / Hike", detail: "distance, time, estimated calories", icon: Footprints, draft: { category: "Outdoor", gymName: "Outdoor", machine: "Walk / hike" } },
  { kind: "swim", label: "Swim", detail: "minutes, distance, stroke", icon: Waves },
  { kind: "yoga", label: "Yoga", detail: "minutes, focus, notes", icon: Flame },
  { kind: "meal", label: "Meal", detail: "calories, protein, notes", icon: Salad },
  { kind: "water", label: "Water", detail: "ounces and date", icon: Droplets },
  { kind: "sleep", label: "Sleep", detail: "hours, quality, notes", icon: Moon },
  { kind: "mood", label: "Meditation / Reset", detail: "meditate or redirect", icon: Brain },
];

const primaryLogLabels = new Set(["Weigh-in", "Bike session", "Gym equipment", "Push-ups", "Meal", "Meditation / Reset"]);
const primaryLogTypes = logTypes.filter((item) => primaryLogLabels.has(item.label));

const secondaryLogTypes = logTypes.filter((item) => !primaryLogLabels.has(item.label));
const moods = ["stress", "anger", "boredom", "energy", "habit"];
const replacementActions = ["Meditated", "Went to the gym", "Walked", "Journaled", "Called a friend", "Early bedtime"];

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
    detail: "Protect the day with a reset practice",
    kind: "mood",
    icon: Zap,
  },
] as const;

export function QuickAdd({
  onSelect,
  onVoiceLogs,
  profile,
}: {
  onSelect: (kind: LogKind, draft?: Record<string, string | boolean>) => void;
  onVoiceLogs?: (items: VoiceLogItem[]) => void;
  profile?: OnboardingProfile | null;
}) {
  return (
    <Section id="quick-add" eyebrow="Capture fast" title="Quick Add">
      {onVoiceLogs ? <VoiceWorkoutLog onSave={onVoiceLogs} profile={profile} /> : null}

      <div className="panel mb-4 p-4">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="metric-label">Most used</p>
            <h3 className="mt-1 text-xl font-semibold text-porcelain">One tap, then only the fields that matter.</h3>
          </div>
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne">
            <Zap size={19} strokeWidth={2.2} aria-hidden />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {primaryLogTypes.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onSelect(item.kind, item.draft)}
                className="app-card min-h-[7.25rem] rounded-[1.35rem] p-3 text-left transition active:scale-[0.98] hover:brightness-105"
              >
                <Icon className="mb-3 text-champagne" size={20} strokeWidth={2.1} aria-hidden />
                <span className="block text-sm font-black text-[rgb(var(--text-primary))]">{item.label}</span>
                <span className="app-subtle mt-1 block text-xs leading-4">{item.detail}</span>
              </button>
            );
          })}
        </div>

        <div className="app-card mt-4 rounded-[1.35rem] p-3">
          <p className="metric-label mb-3">Meditation / reset</p>
          <p className="app-secondary mb-3 text-sm leading-5">Log the thing you did instead. The private context stays private; the replacement becomes the record.</p>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                type="button"
                onClick={() => onSelect("mood", { reason: mood })}
                className="app-chip rounded-full px-3 py-2 text-xs font-semibold capitalize transition hover:brightness-105"
              >
                {mood}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {replacementActions.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => onSelect("mood", { label: action })}
                className="app-primary-action rounded-2xl px-3 py-3 text-sm font-bold"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="panel mb-4 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="metric-label">Saved routines</p>
            <p className="app-secondary mt-1 text-sm font-semibold">Shortcuts for the days you do not want to think.</p>
          </div>
          <Home className="text-champagne" size={20} strokeWidth={2.2} aria-hidden />
        </div>
        <div className="grid gap-2">
          {routineShortcuts.map((routine) => {
            const Icon = routine.icon;
            return (
              <button
                key={routine.title}
                type="button"
                onClick={() => onSelect(routine.kind)}
                className="app-card flex items-center gap-3 rounded-2xl p-3 text-left transition active:scale-[0.98] hover:brightness-105"
              >
                <div className="app-icon-soft grid size-10 shrink-0 place-items-center rounded-full">
                  <Icon size={18} strokeWidth={2.2} aria-hidden />
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-[rgb(var(--text-primary))]">{routine.title}</span>
                  <span className="app-subtle mt-1 block text-sm leading-5">{routine.detail}</span>
                </span>
                <ChevronRight className="app-subtle" size={18} strokeWidth={2.2} aria-hidden />
              </button>
            );
          })}
        </div>
      </div>

      <WorkoutStopwatch />

      <div className="panel p-4">
        <div className="mb-3">
          <p className="metric-label">All logs</p>
          <p className="app-secondary mt-1 text-sm font-semibold">Everything else stays here, organized as compact actions.</p>
        </div>
        <div className="grid gap-2">
          {secondaryLogTypes.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onSelect(item.kind, item.draft)}
                className="app-card flex items-center gap-3 rounded-2xl p-3 text-left transition active:scale-[0.98] hover:brightness-105"
              >
                <div className="app-icon-soft grid size-10 shrink-0 place-items-center rounded-full">
                  <Icon size={18} strokeWidth={2.2} aria-hidden />
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black text-[rgb(var(--text-primary))]">{item.label}</span>
                  <span className="app-subtle mt-1 block text-xs leading-4">{item.detail}</span>
                </span>
                <ChevronRight className="app-subtle" size={18} strokeWidth={2.2} aria-hidden />
              </button>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
