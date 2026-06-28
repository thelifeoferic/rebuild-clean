"use client";

import { Bike, CalendarDays, ChevronLeft, ChevronRight, Copy, Dumbbell, Flame, Pencil, Plus, Salad, Scale, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { Section } from "@/components/section";
import { bikeDistanceForSession } from "@/lib/bike-distance";
import { formatLogDate, getTodayIso, normalizeLogDate, timeToSeconds } from "@/lib/rebuild-data";
import type { LogKind, RebuildData } from "@/types/rebuild";

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
};

export function DailyCalendar({ data, onDelete, onDuplicate, onEdit, onOpenLog }: DailyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(getTodayIso());
  const entries = useMemo(() => getDayEntries(data, selectedDate), [data, selectedDate]);
  const summary = useMemo(() => getDaySummary(data, selectedDate), [data, selectedDate]);
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
          <button
            type="button"
            onClick={() => setSelectedDate(getTodayIso())}
            className="min-h-10 rounded-full bg-champagne px-4 text-sm font-black text-carbon"
          >
            Today
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <SummaryCard label="Entries" value={`${entries.length}`} />
          <SummaryCard label="Movement" value={`${summary.movementMinutes} min`} />
          <SummaryCard label="Food" value={`${summary.calories} cal`} />
          <SummaryCard label="Protein" value={`${summary.protein}g`} />
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
              action={{ label: "Log this day", onClick: () => onOpenLog("weight", { date: selectedDate }) }}
              detail="Pick a date or save the first entry for this day. Edits you make will move logs into the right calendar day."
              icon={CalendarDays}
              title="No entries on this date."
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpenLog("meal", { date: selectedDate })}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] text-sm font-bold text-porcelain"
        >
          <Plus size={17} strokeWidth={2.3} aria-hidden />
          Add food or another log
        </button>
      </div>
    </Section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <p className="metric-label">{label}</p>
      <p className="mt-1 text-xl font-semibold text-porcelain">{value}</p>
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
        tone === "danger" ? "bg-ember/10 text-ember" : "bg-white/10 text-white/65"
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

  data.behaviorWins.filter((entry) => matches(entry.date)).forEach((entry) => entries.push({
    detail: entry.label.includes("->") || entry.label.includes("→") ? entry.label : `Pattern interrupted -> ${entry.label}`,
    id: entry.id,
    kind: "mood",
    title: "Pattern interrupt",
  }));

  return entries;
}

function getDaySummary(data: RebuildData, selectedDate: string) {
  const matches = (date?: string) => normalizeLogDate(date) === selectedDate;
  const movementMinutes =
    data.bikeSessions.filter((entry) => matches(entry.date)).reduce((sum, entry) => sum + entry.minutes, 0) +
    data.swimSessions.filter((entry) => matches(entry.date)).reduce((sum, entry) => sum + entry.minutes, 0) +
    data.yogaSessions.filter((entry) => matches(entry.date)).reduce((sum, entry) => sum + entry.minutes, 0) +
    data.machineWorkoutSessions.filter((entry) => matches(entry.date)).reduce((sum, entry) => sum + (entry.minutes ?? Math.max((entry.sets ?? 0) * 4, 0)), 0) +
    data.jacobsLadderSessions.filter((entry) => matches(entry.date)).reduce((sum, entry) => sum + Math.round(timeToSeconds(entry.duration) / 60), 0);
  const meals = data.meals.filter((entry) => matches(entry.date));

  return {
    calories: meals.reduce((sum, entry) => sum + entry.calories, 0),
    movementMinutes,
    protein: meals.reduce((sum, entry) => sum + entry.protein, 0),
  };
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
  return Dumbbell;
}

function shiftDate(iso: string, days: number) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
