"use client";

import {
  Bed,
  Bike,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  Droplets,
  Dumbbell,
  Flame,
  Pencil,
  Plus,
  Salad,
  Scale,
  Timer,
  Trash2,
  Trophy,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { Section } from "@/components/section";
import { getDailyCalorieGuideForDate } from "@/lib/activity-calories";
import { bikeDistanceForSession } from "@/lib/bike-distance";
import { formatLogDate, getTodayIso, normalizeLogDate, timeToSeconds } from "@/lib/rebuild-data";
import type { LogKind, OnboardingProfile, RebuildData } from "@/types/rebuild";

type DayEntry = {
  detail: string;
  id: string;
  kind: LogKind;
  stat?: string;
  title: string;
};

type DailyCalendarProps = {
  data: RebuildData;
  onDelete: (kind: LogKind, id: string) => void;
  onDuplicate: (kind: LogKind, id: string) => void;
  onEdit: (kind: LogKind, id: string) => void;
  onOpenLog: (kind: LogKind, draft?: Record<string, string>) => void;
  profile: OnboardingProfile | null;
};

type DailyAddOption = {
  detail: string;
  draft?: Record<string, string>;
  icon: LucideIcon;
  kind: LogKind;
  label: string;
};

const dailyAddOptions: DailyAddOption[] = [
  { detail: "Scale check-in for this date", icon: Scale, kind: "weight", label: "Weigh-in" },
  { detail: "Minutes, resistance, distance", icon: Bike, kind: "bike", label: "Bike" },
  { detail: "Machine, free weights, cable work", icon: Dumbbell, kind: "strength", label: "Strength" },
  { detail: "Gym equipment and stations", icon: Dumbbell, kind: "machine", label: "Machine" },
  { detail: "Exercise, load, reps", icon: Dumbbell, kind: "kettlebell", label: "Kettlebell" },
  { detail: "Sets and reps", icon: Trophy, kind: "pushUps", label: "Push-ups" },
  { detail: "Rounds and continuous time", icon: Timer, kind: "jacobsLadder", label: "Jacob's Ladder" },
  { detail: "Load, distance, rounds", icon: Dumbbell, kind: "farmerCarries", label: "Farmer carry" },
  { detail: "Laps, stroke, minutes", icon: Waves, kind: "swim", label: "Swim" },
  { detail: "Flow, mobility, recovery", icon: Flame, kind: "yoga", label: "Yoga" },
  { detail: "Calories, protein, notes", icon: Salad, kind: "meal", label: "Food" },
  { detail: "Ounces toward the day", icon: Droplets, kind: "water", label: "Water" },
  { detail: "Hours and quality", icon: Bed, kind: "sleep", label: "Sleep" },
  { detail: "Log the pause", draft: { label: "Meditated", reason: "stress" }, icon: Wind, kind: "mood", label: "Meditation" },
];

export function DailyCalendar({ data, onDelete, onDuplicate, onEdit, onOpenLog, profile }: DailyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(getTodayIso());
  const [showAddMenu, setShowAddMenu] = useState(false);
  const entries = useMemo(() => getDayEntries(data, selectedDate), [data, selectedDate]);
  const summary = useMemo(() => getDaySummary(data, profile, selectedDate), [data, profile, selectedDate]);
  const viewingToday = selectedDate === getTodayIso();

  function confirmDelete(entry: DayEntry) {
    if (window.confirm(`Delete ${entry.title}?`)) onDelete(entry.kind, entry.id);
  }

  return (
    <Section id="calendar" eyebrow={viewingToday ? "Today" : "Choose the day"} title={viewingToday ? "Today" : "Daily Calendar"}>
      <div className="panel p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
            className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-carbon/70 text-white/65"
            aria-label="Previous day"
          >
            <ChevronLeft size={19} strokeWidth={2.3} aria-hidden />
          </button>
          <label className="min-w-0 flex-1">
            <span className="sr-only">Select date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(normalizeLogDate(event.target.value, getTodayIso()))}
              className="min-h-11 w-full rounded-2xl border border-white/10 bg-carbon px-3 text-center text-base font-bold text-porcelain outline-none focus:border-champagne"
            />
          </label>
          <button
            type="button"
            onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
            className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-carbon/70 text-white/65"
            aria-label="Next day"
          >
            <ChevronRight size={19} strokeWidth={2.3} aria-hidden />
          </button>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="metric-label">Viewing</p>
            <h3 className="mt-1 text-2xl font-semibold text-porcelain">{formatLogDate(selectedDate)}</h3>
          </div>
          {!viewingToday ? (
            <button
              type="button"
              onClick={() => setSelectedDate(getTodayIso())}
              className="app-primary-action min-h-10 rounded-full px-4 text-sm font-black"
            >
              Back to today
            </button>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <SummaryCard label="Activities logged" value={`${entries.length}`} />
          <SummaryCard label="Exercise time" value={`${summary.exerciseMinutes} min`} />
          <SummaryCard
            detail={`${formatCalories(Math.abs(summary.caloriesRemaining))} ${summary.caloriesRemaining >= 0 ? "left" : "over"} · +${formatCalories(summary.activityBurn)} exercise`}
            label="Food"
            value={`${formatCalories(summary.calories)} / ${formatCalories(summary.calorieTarget)}`}
          />
          <SummaryCard
            detail={`${Math.max(summary.proteinTarget - summary.protein, 0)}g to ${summary.proteinTarget}g target`}
            label="Protein"
            value={`${summary.protein}g`}
          />
        </div>

        <div className="mt-4 space-y-3">
          {entries.length ? (
            entries.map((entry) => {
              const Icon = iconForKind(entry.kind);

              return (
                <article key={`${entry.kind}-${entry.id}`} className="rounded-2xl border border-white/10 bg-carbon/70 p-4">
                  <div className="flex gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-full bg-champagne/10 text-champagne">
                      <Icon size={18} strokeWidth={2.2} aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="truncate text-base font-semibold text-porcelain">{entry.title}</h4>
                          <p className="mt-1 text-sm leading-5 text-white/55">{entry.detail}</p>
                        </div>
                        {entry.stat ? <p className="shrink-0 text-sm font-black text-champagne">{entry.stat}</p> : null}
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <ActionButton icon={Pencil} label="Edit" onClick={() => onEdit(entry.kind, entry.id)} />
                        <ActionButton icon={Copy} label="Repeat" onClick={() => onDuplicate(entry.kind, entry.id)} />
                        <ActionButton icon={Trash2} label="Delete" onClick={() => confirmDelete(entry)} tone="danger" />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <EmptyState
              action={{ label: "Add to this day", onClick: () => setShowAddMenu(true) }}
              detail="Pick a date or save the first activity for this day. Edits you make will move logs into the right calendar day."
              icon={CalendarDays}
              title="No activity logged on this date."
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowAddMenu((current) => !current)}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] text-sm font-bold text-porcelain"
          aria-expanded={showAddMenu}
        >
          <Plus size={17} strokeWidth={2.3} aria-hidden />
          Add to this day
        </button>

        {showAddMenu ? (
          <div className="mt-3 rounded-3xl border border-white/10 bg-carbon/85 p-3 shadow-panel">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="metric-label">Choose log type</p>
                <p className="mt-1 text-sm font-semibold text-white/50">{formatLogDate(selectedDate)}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMenu(false)}
                className="min-h-9 rounded-full border border-white/10 px-3 text-xs font-bold text-white/60"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {dailyAddOptions.map((option) => {
                const Icon = option.icon;

                return (
                  <button
                    key={`${option.kind}-${option.label}`}
                    type="button"
                    onClick={() => {
                      setShowAddMenu(false);
                      onOpenLog(option.kind, { date: selectedDate, ...(option.draft ?? {}) });
                    }}
                    className="min-h-[5.75rem] rounded-2xl border border-white/10 bg-white/[0.055] p-3 text-left active:scale-[0.98]"
                  >
                    <div className="mb-2 grid size-9 place-items-center rounded-full bg-champagne/10 text-champagne">
                      <Icon size={16} strokeWidth={2.3} aria-hidden />
                    </div>
                    <p className="text-sm font-black leading-tight text-porcelain">{option.label}</p>
                    <p className="mt-1 text-xs font-semibold leading-4 text-white/45">{option.detail}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </Section>
  );
}

function SummaryCard({ detail, label, value }: { detail?: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <p className="metric-label">{label}</p>
      <p className="mt-1 text-xl font-semibold text-porcelain">{value}</p>
      {detail ? <p className="mt-1 text-xs font-semibold leading-4 text-white/45">{detail}</p> : null}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center gap-1 rounded-full px-2 text-xs font-bold ${
        tone === "danger" ? "border border-champagne/20 bg-champagne/10 text-champagne" : "bg-white/10 text-white/65"
      }`}
    >
      <Icon size={13} strokeWidth={2.3} aria-hidden />
      {label}
    </button>
  );
}

function getDayEntries(data: RebuildData, selectedDate: string): DayEntry[] {
  const matches = (date?: string) => normalizeLogDate(date) === selectedDate;
  const entries: DayEntry[] = [];

  data.weights.filter((entry) => matches(entry.date)).forEach((entry) => {
    if (!entry.id) return;
    entries.push({
      detail: `${entry.moment ?? "check-in"} weigh-in`,
      id: entry.id,
      kind: "weight",
      stat: `${entry.weight.toFixed(1)} lb`,
      title: "Weight logged",
    });
  });

  data.bikeSessions.filter((entry) => matches(entry.date)).forEach((entry) => {
    const distance = bikeDistanceForSession(entry);
    entries.push({
      detail: `${entry.minutes} minutes${distance ? ` - ${distance} mi${entry.distanceEstimated || !entry.distanceMiles ? " est." : ""}` : ""} - resistance ${entry.resistance}`,
      id: entry.id,
      kind: "bike",
      stat: `${entry.calories} cal`,
      title: "Bike session",
    });
  });

  data.jacobsLadderSessions.filter((entry) => matches(entry.date)).forEach((entry) => entries.push({
    detail: `${entry.duration} total - ${entry.longestContinuous} longest continuous`,
    id: entry.id,
    kind: "jacobsLadder",
    title: "Jacob's Ladder",
  }));

  data.pushUpSessions.filter((entry) => matches(entry.date)).forEach((entry) => {
    const reps = entry.sets.reduce((sum, set) => sum + set, 0);
    entries.push({ detail: `${entry.sets.length} sets saved`, id: entry.id, kind: "pushUps", stat: `${reps} reps`, title: "Push-ups" });
  });

  data.dumbbellCurlSessions.filter((entry) => matches(entry.date)).forEach((entry) => entries.push({
    detail: `${entry.weight} lb - ${entry.repsEachArm} reps each arm`,
    id: entry.id,
    kind: "dumbbellCurls",
    stat: `${entry.repsEachArm * 2} reps`,
    title: entry.exercise ?? "Dumbbell curls",
  }));

  data.strengthAccessorySessions.filter((entry) => matches(entry.date)).forEach((entry) => entries.push({
    detail: `${entry.weight} lb - ${entry.reps} reps. ${entry.notes}`,
    id: entry.id,
    kind: "strength",
    title: entry.exercise,
  }));

  data.machineWorkoutSessions.filter((entry) => matches(entry.date)).forEach((entry) => {
    const load = entry.weight ? `${entry.weight} lb` : entry.category ?? "machine";
    const reps = entry.sets && entry.reps ? ` - ${entry.sets} x ${entry.reps}` : "";
    const minutes = entry.minutes ? ` - ${entry.minutes} min` : "";
    const distance = entry.distanceMiles ? ` - ${machineOutputDetail(entry.machine, entry.distanceMiles)}` : "";

    entries.push({
      detail: `${load}${reps}${minutes}${distance}. ${entry.notes}`,
      id: entry.id,
      kind: "machine",
      stat: entry.calories ? `${entry.calories} cal` : undefined,
      title: entry.machine,
    });
  });

  data.kettlebellSessions.filter((entry) => matches(entry.date)).forEach((entry) => entries.push({
    detail: `${entry.weight} lb - ${entry.reps} reps`,
    id: entry.id,
    kind: "kettlebell",
    title: entry.exercise,
  }));

  data.farmerCarrySessions.filter((entry) => matches(entry.date)).forEach((entry) => entries.push({
    detail: `${entry.weightEachHand} lb each hand - ${entry.distanceFeet} ft x ${entry.rounds}`,
    id: entry.id,
    kind: "farmerCarries",
    stat: `${entry.distanceFeet * entry.rounds} ft`,
    title: "Farmer carries",
  }));

  data.swimSessions.filter((entry) => matches(entry.date)).forEach((entry) => entries.push({
    detail: `${entry.distance} yd - ${entry.stroke}. ${entry.notes}`,
    id: entry.id,
    kind: "swim",
    stat: `${entry.minutes} min`,
    title: "Swim",
  }));

  data.yogaSessions.filter((entry) => matches(entry.date)).forEach((entry) => entries.push({
    detail: `${entry.focus}. ${entry.notes}`,
    id: entry.id,
    kind: "yoga",
    stat: `${entry.minutes} min`,
    title: "Yoga",
  }));

  data.meals.filter((entry) => matches(entry.date)).forEach((entry) => entries.push({
    detail: `${entry.calories} calories - ${entry.protein}g protein. ${entry.notes}`,
    id: entry.id,
    kind: "meal",
    stat: `${entry.protein}g`,
    title: entry.name,
  }));

  data.waterLogs.filter((entry) => matches(entry.date)).forEach((entry) => entries.push({
    detail: "Hydration saved",
    id: entry.id,
    kind: "water",
    stat: `${entry.ounces} oz`,
    title: "Water",
  }));

  data.sleepLogs.filter((entry) => matches(entry.date)).forEach((entry) => entries.push({
    detail: `${entry.quality} quality. ${entry.notes}`,
    id: entry.id,
    kind: "sleep",
    stat: `${entry.hours} hr`,
    title: "Sleep",
  }));

  data.behaviorWins.filter((entry) => matches(entry.date)).forEach((entry) => {
    const normalizedLabel = entry.label.toLowerCase();
    const isMeditation = /meditat|breath|urge|present|sleep|walk/.test(normalizedLabel);

    entries.push({
      detail: isMeditation
        ? `${entry.label} saved as a reset practice.`
        : entry.label.includes("->") || entry.label.includes("→")
          ? entry.label
          : `Replacement action -> ${entry.label}`,
      id: entry.id,
      kind: "mood",
      title: isMeditation ? "Meditation" : "Reset work",
    });
  });

  return entries;
}

function getDaySummary(data: RebuildData, profile: OnboardingProfile | null, selectedDate: string) {
  const matches = (date?: string) => normalizeLogDate(date) === selectedDate;
  const exerciseMinutes =
    data.bikeSessions.filter((entry) => matches(entry.date)).reduce((sum, entry) => sum + entry.minutes, 0) +
    data.swimSessions.filter((entry) => matches(entry.date)).reduce((sum, entry) => sum + entry.minutes, 0) +
    data.yogaSessions.filter((entry) => matches(entry.date)).reduce((sum, entry) => sum + entry.minutes, 0) +
    data.machineWorkoutSessions.filter((entry) => matches(entry.date)).reduce((sum, entry) => sum + (entry.minutes ?? Math.max((entry.sets ?? 0) * 4, 8)), 0) +
    data.jacobsLadderSessions.filter((entry) => matches(entry.date)).reduce((sum, entry) => sum + Math.round(timeToSeconds(entry.duration) / 60), 0) +
    data.pushUpSessions
      .filter((entry) => matches(entry.date))
      .reduce((sum, entry) => sum + Math.max(entry.sets.reduce((innerSum, set) => innerSum + set, 0) * 0.18, 4), 0) +
    data.dumbbellCurlSessions
      .filter((entry) => matches(entry.date))
      .reduce((sum, entry) => sum + Math.max(entry.repsEachArm * 2 * 0.12, 4), 0) +
    data.strengthAccessorySessions.filter((entry) => matches(entry.date)).reduce((sum, entry) => sum + Math.max(entry.reps * 0.2, 8), 0) +
    data.kettlebellSessions.filter((entry) => matches(entry.date)).reduce((sum, entry) => sum + Math.max(entry.reps * 0.08, 6), 0) +
    data.farmerCarrySessions.filter((entry) => matches(entry.date)).reduce((sum, entry) => sum + Math.max(entry.rounds * 2, 4), 0);
  const meals = data.meals.filter((entry) => matches(entry.date));
  const calories = meals.reduce((sum, entry) => sum + entry.calories, 0);
  const calorieGuide = getDailyCalorieGuideForDate(data, profile, calories, selectedDate);
  const protein = meals.reduce((sum, entry) => sum + entry.protein, 0);
  const referenceWeight = data.weights[0]?.weight || profile?.currentWeight || 200;
  const proteinTarget = Math.round(referenceWeight * 0.7);

  return {
    activityBurn: calorieGuide.activityBurn,
    calorieTarget: calorieGuide.totalGuide,
    calories,
    caloriesRemaining: calorieGuide.remaining,
    exerciseMinutes: Math.round(exerciseMinutes),
    protein,
    proteinTarget,
  };
}

function formatCalories(value: number) {
  return `${Math.round(value).toLocaleString()} cal`;
}

function machineOutputDetail(machine: string, value: number) {
  if (machine.toLowerCase().includes("stair")) return `${value} floors`;
  return `${value} mi`;
}

function iconForKind(kind: LogKind) {
  if (kind === "weight") return Scale;
  if (kind === "bike") return Bike;
  if (kind === "machine") return Dumbbell;
  if (kind === "meal") return Salad;
  if (kind === "mood") return Flame;
  if (kind === "water") return Droplets;
  if (kind === "sleep") return Bed;
  if (kind === "swim") return Waves;
  if (kind === "yoga") return Flame;
  if (kind === "jacobsLadder") return Timer;
  if (kind === "pushUps") return Trophy;
  return Dumbbell;
}

function shiftDate(iso: string, days: number) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
