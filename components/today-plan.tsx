import { Bike, Flame, Salad, Scale } from "lucide-react";
import type { LogKind, RebuildData } from "@/types/rebuild";
import { getTodaysBikeMinutes, getTodaysPushUps, isToday } from "@/lib/rebuild-data";

const items = [
  { key: "weight", label: "Weigh in", detail: "Start with the truth.", icon: Scale },
  { key: "movement", label: "Move", detail: "Bike, lift, swim, yoga, or walk.", icon: Bike },
  { key: "protein", label: "Fuel", detail: "Log one protein anchor.", icon: Salad },
  { key: "reset", label: "Protect", detail: "Track the better choice.", icon: Flame },
] as const;

export function TodayPlan({
  data,
  onOpenLog,
}: {
  data: RebuildData;
  onOpenLog: (kind: LogKind) => void;
}) {
  const completed = {
    weight: data.weights.some((entry) => isToday(entry.date)),
    movement:
      getTodaysBikeMinutes(data) > 0 ||
      getTodaysPushUps(data) > 0 ||
      data.kettlebellSessions.some((entry) => isToday(entry.date)) ||
      data.swimSessions.some((entry) => isToday(entry.date)) ||
      data.yogaSessions.some((entry) => isToday(entry.date)),
    protein: data.meals.some((meal) => meal.protein >= 25),
    reset: data.behaviorWins.some((win) => isToday(win.date)),
  };

  function targetFor(key: keyof typeof completed): LogKind {
    if (key === "weight") return "weight";
    if (key === "protein") return "meal";
    if (key === "reset") return "mood";
    return "bike";
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
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onOpenLog(targetFor(item.key))}
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
