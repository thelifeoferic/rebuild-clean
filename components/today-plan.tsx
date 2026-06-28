"use client";

import { Bike, Dumbbell, Flame, Salad, Scale, Timer, Trophy, Waves } from "lucide-react";
import { useState } from "react";
import type { LogKind, RebuildData } from "@/types/rebuild";
import { getTodaysBikeMinutes, getTodaysPushUps, isToday } from "@/lib/rebuild-data";

const items = [
  { key: "weight", label: "Weigh in", detail: "Start with the truth.", icon: Scale },
  { key: "movement", label: "Move", detail: "Choose the work that fits today.", icon: Bike },
  { key: "protein", label: "Fuel", detail: "Log one protein anchor.", icon: Salad },
  { key: "reset", label: "Meditate", detail: "Did you meditate today?", icon: Flame },
] as const;

const movementChoices: { kind: LogKind; label: string; icon: typeof Bike }[] = [
  { kind: "bike", label: "Bike", icon: Bike },
  { kind: "jacobsLadder", label: "Ladder", icon: Timer },
  { kind: "strength", label: "Strength", icon: Dumbbell },
  { kind: "machine", label: "Machine", icon: Dumbbell },
  { kind: "pushUps", label: "Push-ups", icon: Trophy },
  { kind: "kettlebell", label: "Kettlebell", icon: Dumbbell },
  { kind: "swim", label: "Swim", icon: Waves },
  { kind: "yoga", label: "Yoga", icon: Flame },
];

export function TodayPlan({
  data,
  onOpenLog,
}: {
  data: RebuildData;
  onOpenLog: (kind: LogKind, draft?: Record<string, string>) => void;
}) {
  const [selectedMovement, setSelectedMovement] = useState<LogKind>("bike");
  const completed = {
    weight: data.weights.some((entry) => isToday(entry.date)),
    movement:
      getTodaysBikeMinutes(data) > 0 ||
      getTodaysPushUps(data) > 0 ||
      data.jacobsLadderSessions.some((entry) => isToday(entry.date)) ||
      data.dumbbellCurlSessions.some((entry) => isToday(entry.date)) ||
      data.strengthAccessorySessions.some((entry) => isToday(entry.date)) ||
      data.machineWorkoutSessions.some((entry) => isToday(entry.date)) ||
      data.kettlebellSessions.some((entry) => isToday(entry.date)) ||
      data.farmerCarrySessions.some((entry) => isToday(entry.date)) ||
      data.swimSessions.some((entry) => isToday(entry.date)) ||
      data.yogaSessions.some((entry) => isToday(entry.date)),
    protein: data.meals.some((meal) => (!meal.date || isToday(meal.date)) && meal.protein >= 25),
    reset: hasMeditatedToday(data),
  };

  function targetFor(key: keyof typeof completed): LogKind {
    if (key === "weight") return "weight";
    if (key === "protein") return "meal";
    if (key === "reset") return "mood";
    return "strength";
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="metric-label">Today plan</p>
          <h3 className="mt-1 text-lg font-semibold text-porcelain">Four anchors</h3>
        </div>
        <p className="text-sm font-bold text-champagne">{Object.values(completed).filter(Boolean).length}/4</p>
      </div>
      <div className="grid gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isDone = completed[item.key];

          if (item.key === "movement") {
            const selectedChoice = movementChoices.find((choice) => choice.kind === selectedMovement) ?? movementChoices[0];
            const SelectedIcon = selectedChoice.icon;

            return (
              <div
                key={item.key}
                className={`rounded-2xl border p-3 transition ${
                  isDone ? "border-signal/30 bg-signal/10" : "border-white/10 bg-carbon/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`grid size-10 place-items-center rounded-full ${isDone ? "bg-signal/15 text-signal" : "bg-white/10 text-champagne"}`}>
                    <Icon size={18} strokeWidth={2.2} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-porcelain">{item.label}</p>
                    <p className="text-sm text-white/48">{isDone ? "Done today" : selectedChoice.label}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                  <label className="flex min-h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-3 focus-within:border-champagne">
                    <SelectedIcon size={16} className="shrink-0 text-champagne" strokeWidth={2.2} aria-hidden />
                    <select
                      value={selectedMovement}
                      onChange={(event) => setSelectedMovement(event.target.value as LogKind)}
                      className="min-w-0 flex-1 bg-transparent text-sm font-bold text-porcelain outline-none"
                      aria-label="Choose movement log type"
                    >
                      {movementChoices.map((choice) => (
                        <option key={choice.kind} value={choice.kind}>
                          {choice.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => onOpenLog(selectedMovement)}
                    className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-champagne px-4 text-sm font-black text-carbon"
                  >
                    Log
                  </button>
                </div>
              </div>
            );
          }

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                if (item.key === "reset") {
                  onOpenLog("mood", { label: "Meditation", reason: "stress" });
                  return;
                }

                onOpenLog(targetFor(item.key));
              }}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                isDone ? "border-signal/30 bg-signal/10" : "border-white/10 bg-carbon/70"
              }`}
            >
              <div className={`grid size-10 place-items-center rounded-full ${isDone ? "bg-signal/15 text-signal" : "bg-white/10 text-champagne"}`}>
                <Icon size={18} strokeWidth={2.2} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-porcelain">{item.label}</p>
                <p className="text-sm text-white/48">{isDone ? "Done today" : item.detail}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function hasMeditatedToday(data: RebuildData) {
  return (
    data.behaviorWins.some((entry) => isToday(entry.date) && isMeditationLabel(entry.label)) ||
    data.yogaSessions.some((entry) => isToday(entry.date) && isMeditationLabel(entry.focus))
  );
}

function isMeditationLabel(value?: string) {
  const normalized = String(value ?? "").toLowerCase();
  return normalized.includes("meditat") || normalized.includes("breath") || normalized.includes("stayed present");
}
