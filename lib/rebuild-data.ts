import { seedData } from "@/data/mock-data";
import type { RebuildData, TimelineItem } from "@/types/rebuild";

export const storageKey = "rebuild:data:v3";
export const todayLabel = "June 24, 2026";

export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}`;
}

export function cloneSeedData(): RebuildData {
  return JSON.parse(JSON.stringify(seedData)) as RebuildData;
}

export function normalizeRebuildData(data: Partial<RebuildData>): RebuildData {
  const seed = cloneSeedData();

  return {
    weights: data.weights ?? seed.weights,
    bikeSessions: data.bikeSessions ?? seed.bikeSessions,
    jacobsLadderSessions: data.jacobsLadderSessions ?? seed.jacobsLadderSessions,
    pushUpSessions: data.pushUpSessions ?? seed.pushUpSessions,
    dumbbellCurlSessions: data.dumbbellCurlSessions ?? seed.dumbbellCurlSessions,
    kettlebellSessions: data.kettlebellSessions ?? seed.kettlebellSessions,
    farmerCarrySessions: data.farmerCarrySessions ?? seed.farmerCarrySessions,
    strengthAccessorySessions: data.strengthAccessorySessions ?? seed.strengthAccessorySessions,
    meals: data.meals ?? seed.meals,
    behaviorWins: data.behaviorWins ?? seed.behaviorWins,
  };
}

export function getSevenDayAverageWeight(data: RebuildData) {
  const entries = data.weights.slice(0, 7);
  if (!entries.length) return 0;
  return Math.round((entries.reduce((sum, item) => sum + item.weight, 0) / entries.length) * 10) / 10;
}

export function getWeeklyBikeMinutes(data: RebuildData) {
  return data.bikeSessions.reduce((sum, session) => sum + session.minutes, 0);
}

export function getTodaysBikeMinutes(data: RebuildData) {
  return data.bikeSessions.filter((session) => isToday(session.date)).reduce((sum, session) => sum + session.minutes, 0);
}

export function getBestJacobsLadderTime(data: RebuildData) {
  return data.jacobsLadderSessions
    .map((session) => session.longestContinuous)
    .sort((a, b) => timeToSeconds(b) - timeToSeconds(a))[0] ?? "0:00";
}

export function getPushUpMaxSet(data: RebuildData) {
  const sets = data.pushUpSessions.flatMap((session) => session.sets);
  return sets.length ? Math.max(...sets) : 0;
}

export function getTodaysPushUps(data: RebuildData) {
  return data.pushUpSessions
    .filter((session) => isToday(session.date))
    .flatMap((session) => session.sets)
    .reduce((sum, reps) => sum + reps, 0);
}

export function isToday(date: string) {
  return date === "Today" || date === todayLabel;
}

export function getRecentLowWeight(data: RebuildData) {
  if (!data.weights.length) return 0;
  return Math.min(...data.weights.map((entry) => entry.weight));
}

export function buildTimeline(data: RebuildData): TimelineItem[] {
  const items: TimelineItem[] = [];

  data.behaviorWins.slice(0, 4).forEach((win) => {
    items.push({
      id: `tl-${win.id}`,
      date: win.date,
      title: win.didntSmoke && win.didntSpiral ? "Protected the reset" : "Logged a reset",
      detail: win.label,
      tone: win.didntSmoke && win.didntSpiral ? "green" : "steel",
    });
  });

  data.bikeSessions.slice(0, 3).forEach((ride) => {
    items.push({
      id: `tl-${ride.id}`,
      date: ride.date,
      title: "Bike session logged",
      detail: `${ride.minutes} minutes at resistance ${ride.resistance} with ${ride.calories} calories.`,
      tone: "gold",
    });
  });

  const bestLadder = getBestJacobsLadderTime(data);
  if (bestLadder !== "0:00") {
    items.push({
      id: "tl-best-ladder",
      date: "Best",
      title: `Jacob's Ladder ${bestLadder} continuous`,
      detail: "Benchmark locked for the next attempt.",
      tone: "ember",
    });
  }

  if (!items.length) {
    return [
      {
        id: "tl-fresh-start",
        date: "Tomorrow",
        title: "Fresh start queued",
        detail: "Log the first weight, workout, meal, or reset win to begin the new timeline.",
        tone: "steel",
      },
    ];
  }

  return items.slice(0, 8);
}

export function timeToSeconds(value: string) {
  const parts = value.split(":").map(Number);
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return Number(value) || 0;
}
