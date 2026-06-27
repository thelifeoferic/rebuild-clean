import { seedData } from "@/data/mock-data";
import type { RebuildData, TimelineItem } from "@/types/rebuild";

export const storageKey = "rebuild:data:v3";
export const legacyTodayIso = "2026-06-24";
export const todayLabel = "June 24, 2026";
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}`;
}

export function cloneSeedData(): RebuildData {
  return normalizeDataDates(JSON.parse(JSON.stringify(seedData)) as RebuildData);
}

export function normalizeRebuildData(data: Partial<RebuildData>): RebuildData {
  const seed = cloneSeedData();

  return normalizeDataDates({
    weights: data.weights ?? seed.weights,
    bikeSessions: data.bikeSessions ?? seed.bikeSessions,
    jacobsLadderSessions: data.jacobsLadderSessions ?? seed.jacobsLadderSessions,
    pushUpSessions: data.pushUpSessions ?? seed.pushUpSessions,
    dumbbellCurlSessions: data.dumbbellCurlSessions ?? seed.dumbbellCurlSessions,
    kettlebellSessions: data.kettlebellSessions ?? seed.kettlebellSessions,
    farmerCarrySessions: data.farmerCarrySessions ?? seed.farmerCarrySessions,
    strengthAccessorySessions: data.strengthAccessorySessions ?? seed.strengthAccessorySessions,
    machineWorkoutSessions: data.machineWorkoutSessions ?? seed.machineWorkoutSessions,
    swimSessions: data.swimSessions ?? seed.swimSessions,
    yogaSessions: data.yogaSessions ?? seed.yogaSessions,
    meals: data.meals ?? seed.meals,
    waterLogs: data.waterLogs ?? seed.waterLogs,
    sleepLogs: data.sleepLogs ?? seed.sleepLogs,
    behaviorWins: data.behaviorWins ?? seed.behaviorWins,
  });
}

export function getTodayIso(date = new Date()) {
  return toIsoDate(date);
}

export function normalizeLogDate(value?: string | null, fallback = legacyTodayIso) {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  if (isoDatePattern.test(raw)) return raw;

  const lower = raw.toLowerCase();
  if (lower === "today" || raw === todayLabel) return legacyTodayIso;
  if (lower === "yesterday") return addDaysIso(getTodayIso(), -1);
  if (lower === "tomorrow") return addDaysIso(getTodayIso(), 1);

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return toIsoDate(parsed);
  return fallback;
}

export function formatLogDate(value?: string | null) {
  const iso = normalizeLogDate(value);
  const today = getTodayIso();
  if (iso === today) return "Today";
  if (iso === addDaysIso(today, -1)) return "Yesterday";

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dateFromIso(iso));
}

export function daysBetweenCalendarDates(startIso: string, endIso: string) {
  const start = dateFromIso(startIso).getTime();
  const end = dateFromIso(endIso).getTime();
  return Math.floor((end - start) / 86_400_000);
}

export function getSevenDayAverageWeight(data: RebuildData) {
  const entries = data.weights.slice(0, 7);
  if (!entries.length) return 0;
  return Math.round((entries.reduce((sum, item) => sum + item.weight, 0) / entries.length) * 10) / 10;
}

export function getWeeklyBikeMinutes(data: RebuildData) {
  return data.bikeSessions.reduce((sum, session) => sum + session.minutes, 0);
}

export function getWeeklyBikeDistance(data: RebuildData) {
  return roundDistance(data.bikeSessions.reduce((sum, session) => sum + (session.distanceMiles ?? 0), 0));
}

export function getTodaysBikeMinutes(data: RebuildData) {
  return data.bikeSessions.filter((session) => isToday(session.date)).reduce((sum, session) => sum + session.minutes, 0);
}

export function getTodaysBikeDistance(data: RebuildData) {
  return roundDistance(
    data.bikeSessions
      .filter((session) => isToday(session.date))
      .reduce((sum, session) => sum + (session.distanceMiles ?? 0), 0),
  );
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

export function getTotalPushUps(data: RebuildData) {
  return data.pushUpSessions
    .flatMap((session) => session.sets)
    .reduce((sum, reps) => sum + reps, 0);
}

export function getTodaysCalories(data: RebuildData) {
  return data.meals.filter((meal) => meal.date && isToday(meal.date)).reduce((sum, meal) => sum + meal.calories, 0);
}

export function getTodaysProtein(data: RebuildData) {
  return data.meals.filter((meal) => meal.date && isToday(meal.date)).reduce((sum, meal) => sum + meal.protein, 0);
}

export function getTodaysWaterOunces(data: RebuildData) {
  return data.waterLogs.filter((entry) => isToday(entry.date)).reduce((sum, entry) => sum + entry.ounces, 0);
}

export function getLatestSleep(data: RebuildData) {
  return data.sleepLogs[0] ?? null;
}

export function isToday(date: string) {
  return normalizeLogDate(date) === getTodayIso();
}

export function getRecentLowWeight(data: RebuildData) {
  if (!data.weights.length) return 0;
  return Math.min(...data.weights.map((entry) => entry.weight));
}

export function getWeightChangeFromLast(data: RebuildData) {
  if (data.weights.length < 2) return 0;
  return Math.round((data.weights[0].weight - data.weights[1].weight) * 10) / 10;
}

export function buildTimeline(data: RebuildData): TimelineItem[] {
  const items: TimelineItem[] = [];

  data.weights.slice(0, 4).forEach((entry) => {
    items.push({
      id: `tl-${entry.id ?? `${entry.date}-${entry.weight}`}`,
      date: formatLogDate(entry.date),
      title: "Weight logged",
      detail: `${entry.weight.toFixed(1)} lb saved as a ${entry.moment ?? "check-in"} entry.`,
      tone: "steel",
      editable: entry.id ? { kind: "weight", id: entry.id } : undefined,
    });
  });

  data.behaviorWins.slice(0, 4).forEach((win) => {
    items.push({
      id: `tl-${win.id}`,
      date: formatLogDate(win.date),
      title: "Pattern interrupted",
      detail: normalizePatternLabel(win.label),
      tone: win.didntSmoke && win.didntSpiral ? "green" : "steel",
      editable: { kind: "mood", id: win.id },
    });
  });

  data.bikeSessions.slice(0, 3).forEach((ride) => {
    const distance = ride.distanceMiles ? ` · ${formatDistance(ride.distanceMiles)}` : "";
    items.push({
      id: `tl-${ride.id}`,
      date: formatLogDate(ride.date),
      title: "Bike session logged",
      detail: `${ride.minutes} minutes${distance} at resistance ${ride.resistance} with ${ride.calories} calories.`,
      tone: "gold",
      editable: { kind: "bike", id: ride.id },
    });
  });

  data.jacobsLadderSessions.slice(0, 2).forEach((session) => {
    items.push({
      id: `tl-${session.id}`,
      date: formatLogDate(session.date),
      title: "Jacob's Ladder logged",
      detail: `${session.duration} total · ${session.longestContinuous} longest continuous.`,
      tone: "ember",
      editable: { kind: "jacobsLadder", id: session.id },
    });
  });

  data.pushUpSessions.slice(0, 3).forEach((session) => {
    const total = session.sets.reduce((sum, reps) => sum + reps, 0);
    items.push({
      id: `tl-${session.id}`,
      date: formatLogDate(session.date),
      title: "Push-ups logged",
      detail: `${total} total reps across ${session.sets.length} sets.`,
      tone: "green",
      editable: { kind: "pushUps", id: session.id },
    });
  });

  data.kettlebellSessions.slice(0, 3).forEach((move) => {
    items.push({
      id: `tl-${move.id}`,
      date: formatLogDate(move.date),
      title: `${move.exercise} logged`,
      detail: `${move.reps} reps at ${move.weight} lb.`,
      tone: "gold",
      editable: { kind: "kettlebell", id: move.id },
    });
  });

  data.dumbbellCurlSessions.slice(0, 2).forEach((curl) => {
    const exercise = curl.exercise ?? "Dumbbell curls";

    items.push({
      id: `tl-${curl.id}`,
      date: formatLogDate(curl.date),
      title: `${exercise} logged`,
      detail: `${curl.weight} lb for ${curl.repsEachArm * 2} total reps.`,
      tone: "ember",
      editable: { kind: "dumbbellCurls", id: curl.id },
    });
  });

  data.farmerCarrySessions.slice(0, 2).forEach((carry) => {
    items.push({
      id: `tl-${carry.id}`,
      date: formatLogDate(carry.date),
      title: "Farmer carries logged",
      detail: `${carry.weightEachHand} lb each hand for ${carry.distanceFeet * carry.rounds} total feet.`,
      tone: "green",
      editable: { kind: "farmerCarries", id: carry.id },
    });
  });

  data.strengthAccessorySessions.slice(0, 2).forEach((move) => {
    items.push({
      id: `tl-${move.id}`,
      date: formatLogDate(move.date),
      title: `${move.exercise} logged`,
      detail: `${move.reps} reps at ${move.weight} lb. ${move.notes}`,
      tone: "steel",
      editable: { kind: "strength", id: move.id },
    });
  });

  data.machineWorkoutSessions.slice(0, 3).forEach((move) => {
    const load = move.weight ? `${move.weight} lb` : move.category ?? "machine work";
    const reps = move.sets && move.reps ? ` · ${move.sets} x ${move.reps}` : "";
    const time = move.minutes ? ` · ${move.minutes} min` : "";
    const distance = move.distanceMiles ? ` · ${formatDistance(move.distanceMiles)}` : "";

    items.push({
      id: `tl-${move.id}`,
      date: formatLogDate(move.date),
      title: `${move.machine} logged`,
      detail: `${load}${reps}${time}${distance}. ${move.notes}`,
      tone: "steel",
      editable: { kind: "machine", id: move.id },
    });
  });

  data.swimSessions.slice(0, 2).forEach((swim) => {
    items.push({
      id: `tl-${swim.id}`,
      date: formatLogDate(swim.date),
      title: "Swim logged",
      detail: `${swim.minutes} minutes · ${swim.distance} yd · ${swim.stroke}. ${swim.notes}`,
      tone: "green",
      editable: { kind: "swim", id: swim.id },
    });
  });

  data.yogaSessions.slice(0, 2).forEach((yoga) => {
    items.push({
      id: `tl-${yoga.id}`,
      date: formatLogDate(yoga.date),
      title: "Yoga logged",
      detail: `${yoga.minutes} minutes focused on ${yoga.focus}. ${yoga.notes}`,
      tone: "steel",
      editable: { kind: "yoga", id: yoga.id },
    });
  });

  data.meals.slice(0, 2).forEach((meal) => {
    items.push({
      id: `tl-${meal.id}`,
      date: formatLogDate(meal.date),
      title: meal.name,
      detail: `${meal.calories} calories · ${meal.protein}g protein. ${meal.notes}`,
      tone: "steel",
      editable: { kind: "meal", id: meal.id },
    });
  });

  data.waterLogs.slice(0, 2).forEach((entry) => {
    items.push({
      id: `tl-${entry.id}`,
      date: formatLogDate(entry.date),
      title: "Water logged",
      detail: `${entry.ounces} oz saved.`,
      tone: "steel",
      editable: { kind: "water", id: entry.id },
    });
  });

  data.sleepLogs.slice(0, 2).forEach((entry) => {
    items.push({
      id: `tl-${entry.id}`,
      date: formatLogDate(entry.date),
      title: "Sleep logged",
      detail: `${entry.hours} hours · ${entry.quality} quality. ${entry.notes}`,
      tone: "steel",
      editable: { kind: "sleep", id: entry.id },
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
        date: "Today",
        title: "Fresh start ready",
        detail: "Log the first weight, workout, meal, or pattern interrupt to begin today's timeline.",
        tone: "steel",
      },
    ];
  }

  return items;
}

export function timeToSeconds(value: string) {
  const parts = value.split(":").map(Number);
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return Number(value) || 0;
}

function roundDistance(value: number) {
  return Math.round(value * 100) / 100;
}

function formatDistance(value: number) {
  return `${roundDistance(value).toFixed(value >= 10 ? 1 : 2)} mi`;
}

function normalizeDataDates(data: RebuildData): RebuildData {
  return {
    ...data,
    weights: data.weights.map(normalizeDatedEntry),
    bikeSessions: data.bikeSessions.map(normalizeDatedEntry),
    jacobsLadderSessions: data.jacobsLadderSessions.map(normalizeDatedEntry),
    pushUpSessions: data.pushUpSessions.map(normalizeDatedEntry),
    dumbbellCurlSessions: data.dumbbellCurlSessions.map(normalizeDatedEntry),
    kettlebellSessions: data.kettlebellSessions.map(normalizeDatedEntry),
    farmerCarrySessions: data.farmerCarrySessions.map(normalizeDatedEntry),
    strengthAccessorySessions: data.strengthAccessorySessions.map(normalizeDatedEntry),
    machineWorkoutSessions: data.machineWorkoutSessions.map(normalizeDatedEntry),
    swimSessions: data.swimSessions.map(normalizeDatedEntry),
    yogaSessions: data.yogaSessions.map(normalizeDatedEntry),
    meals: data.meals.map((meal) => ({ ...meal, date: normalizeLogDate(meal.date, legacyTodayIso) })),
    waterLogs: data.waterLogs.map(normalizeDatedEntry),
    sleepLogs: data.sleepLogs.map(normalizeDatedEntry),
    behaviorWins: data.behaviorWins.map(normalizeDatedEntry),
  };
}

function normalizeDatedEntry<T extends { date: string }>(entry: T): T {
  return { ...entry, date: normalizeLogDate(entry.date, legacyTodayIso) };
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromIso(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDaysIso(iso: string, days: number) {
  const date = dateFromIso(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

function normalizePatternLabel(label: string) {
  const clean = label
    .replace(/did(n't| not) smoke/gi, "interrupted the old loop")
    .replace(/did(n't| not) spiral/gi, "stayed present")
    .replace(/chose the reset instead of the old loop/gi, "Stayed with the better choice");

  return clean.includes("→") ? clean : `Pattern interrupted → ${clean}`;
}
